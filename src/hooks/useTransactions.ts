import { useState, useCallback } from 'react';
import { Transaction, TransactionFormData } from '@/types/transaction';

// Mock data - replace with SQLite integration later
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'income',
    category: 'Gaji',
    amount: 8500000,
    notes: 'Gaji bulanan',
    date: '2024-01-01',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },
  {
    id: '2',
    type: 'expense',
    category: 'Makanan',
    amount: 350000,
    notes: 'Belanja groceries',
    date: '2024-01-15',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '3',
    type: 'expense',
    category: 'Transport',
    amount: 75000,
    notes: 'Bensin motor',
    date: '2024-01-14',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '4',
    type: 'savings',
    category: 'Tabungan Rutin',
    amount: 2250000,
    notes: 'Tabungan bulanan',
    date: '2024-01-01',
    createdAt: '2024-01-01T20:00:00Z',
    updatedAt: '2024-01-01T20:00:00Z',
  },
];

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);

  const addTransaction = useCallback(async (data: TransactionFormData): Promise<Transaction> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      date: data.date.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setIsLoading(false);
    
    return newTransaction;
  }, []);

  const updateTransaction = useCallback(async (id: string, data: TransactionFormData): Promise<Transaction | null> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let updatedTransaction: Transaction | null = null;
    
    setTransactions(prev => prev.map(transaction => {
      if (transaction.id === id) {
        updatedTransaction = {
          ...transaction,
          ...data,
          date: data.date ? data.date.toISOString().split('T')[0] : transaction.date,
          updatedAt: new Date().toISOString(),
        };
        return updatedTransaction;
      }
      return transaction;
    }));
    
    setIsLoading(false);
    return updatedTransaction;
  }, []);

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    setIsLoading(false);
    
    return true;
  }, []);

  const getTransactionStats = useCallback(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = transactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense + savings;
    
    return { income, expense, savings, balance };
  }, [transactions]);

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats,
  };
};