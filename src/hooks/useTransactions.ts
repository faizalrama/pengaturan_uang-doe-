import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { selectQuery, executeQuery } from '@/lib/database';
import { checkBudgetThreshold } from '@/lib/budgetHelper';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (data: TransactionFormData): Promise<Transaction> => {
    setIsLoading(true);
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const newTransaction: Transaction = {
      id: newId,
      ...data,
      date: data.date.toISOString().split('T')[0], // Store date as YYYY-MM-DD string
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    const query = `
      INSERT INTO transactions (id, type, category, amount, notes, date, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      executeQuery(query, [
        newTransaction.id,
        newTransaction.type,
        newTransaction.category,
        newTransaction.amount,
        newTransaction.notes,
        newTransaction.date,
        newTransaction.createdAt,
        newTransaction.updatedAt,
      ]);
      await fetchTransactions(); // Refetch to update the list

      // After adding a new expense, check if it triggers a budget alert
      if (newTransaction.type === 'expense') {
        // Run this check asynchronously and don't block the UI
        checkBudgetThreshold().catch(e => console.error("Error checking budget threshold:", e));
      }

      return newTransaction;
    } catch (err) {
      console.error('Failed to add transaction:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions]);

  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionFormData>): Promise<Transaction | null> => {
    setIsLoading(true);
    const now = new Date().toISOString();

    const existingTransaction = transactions.find(t => t.id === id);
    if (!existingTransaction) {
      setIsLoading(false);
      throw new Error("Transaction not found");
    }

    const updatedData = {
      ...existingTransaction,
      ...data,
      date: data.date ? data.date.toISOString().split('T')[0] : existingTransaction.date,
      updatedAt: now,
    };
    
    const query = `
      UPDATE transactions
      SET type = ?, category = ?, amount = ?, notes = ?, date = ?, updatedAt = ?
      WHERE id = ?
    `;

    try {
      executeQuery(query, [
        updatedData.type,
        updatedData.category,
        updatedData.amount,
        updatedData.notes || '',
        updatedData.date,
        updatedData.updatedAt,
        id,
      ]);
      await fetchTransactions(); // Refetch to update the list
      return updatedData;
    } catch (err) {
      console.error('Failed to update transaction:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [transactions, fetchTransactions]);

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    const query = 'DELETE FROM transactions WHERE id = ?';
    
    try {
      executeQuery(query, [id]);
      await fetchTransactions(); // Refetch to update the list
      return true;
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions]);

  const getTransactionStats = useCallback(() => {
    // This function can now also be implemented with SQL for better performance,
    // but for now, we'll keep it operating on the client-side state
    // to avoid re-querying on every render.
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = transactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense - savings; // Corrected balance calculation
    
    return { income, expense, savings, balance };
  }, [transactions]);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats,
  };
};