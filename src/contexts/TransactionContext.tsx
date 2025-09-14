import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { selectQuery, executeQuery } from '@/lib/database';
import { useDB } from '@/contexts/DBContext';

export interface TransactionStats {
  income: number;
  expense: number;
  savings: number;
  balance: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  stats: TransactionStats;
  isLoading: boolean;
  error: Error | null;
  addTransaction: (data: TransactionFormData) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  fetchTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { isInitialized } = useDB();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({ income: 0, expense: 0, savings: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    setStats({ income, expense, savings, balance });
  }, [transactions]);

  const fetchTransactions = useCallback(() => {
    if (!isInitialized) return;
    setIsLoading(true);
    try {
      const data = selectQuery<Transaction>('SELECT * FROM transactions ORDER BY date DESC, createdAt DESC');
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (data: TransactionFormData): Promise<Transaction> => {
    if (!isInitialized) throw new Error("Database not initialized");
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newTransaction: Transaction = { id: newId, ...data, date: data.date.toISOString().split('T')[0], notes: data.notes || '', createdAt: now, updatedAt: now };
    const query = `INSERT INTO transactions (id, type, category, amount, notes, date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    executeQuery(query, [newTransaction.id, newTransaction.type, newTransaction.category, newTransaction.amount, newTransaction.notes, newTransaction.date, newTransaction.createdAt, newTransaction.updatedAt]);
    fetchTransactions();
    return newTransaction;
  }, [isInitialized, fetchTransactions]);

  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionFormData>): Promise<Transaction | null> => {
    if (!isInitialized) throw new Error("Database not initialized");
    const existing = transactions.find(t => t.id === id);
    if (!existing) throw new Error("Transaction not found");
    const updatedData = { ...existing, ...data, date: data.date ? data.date.toISOString().split('T')[0] : existing.date, notes: data.notes || existing.notes, updatedAt: new Date().toISOString() };
    const query = `UPDATE transactions SET type = ?, category = ?, amount = ?, notes = ?, date = ?, updatedAt = ? WHERE id = ?`;
    executeQuery(query, [updatedData.type, updatedData.category, updatedData.amount, updatedData.notes, updatedData.date, updatedData.updatedAt, id]);
    fetchTransactions();
    return updatedData;
  }, [isInitialized, transactions, fetchTransactions]);

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    if (!isInitialized) throw new Error("Database not initialized");
    const query = 'DELETE FROM transactions WHERE id = ?';
    executeQuery(query, [id]);
    fetchTransactions();
    return true;
  }, [isInitialized, fetchTransactions]);

  const value = {
    transactions,
    stats,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
