export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  category: string;
  amount: number;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  type: 'income' | 'expense' | 'savings';
  category: string;
  amount: number;
  notes?: string;
  date: Date;
}

export const INCOME_CATEGORIES = [
  'Gaji',
  'Freelance', 
  'Investasi',
  'Bonus',
  'Lainnya'
];

export const EXPENSE_CATEGORIES = [
  'Makanan',
  'Transport',
  'Hiburan',
  'Belanja',
  'Tagihan',
  'Kesehatan',
  'Pendidikan',
  'Lainnya'
];

export const SAVINGS_CATEGORIES = [
  'Tabungan Rutin',
  'Dana Darurat',
  'Investasi',
  'Target Khusus',
  'Lainnya'
];