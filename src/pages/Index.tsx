import { useState } from "react";
import { BalanceCard } from "@/components/BalanceCard";
import { QuickStats } from "@/components/QuickStats";
import { RecentTransactions } from "@/components/RecentTransactions";
import { ExpenseChart } from "@/components/ExpenseChart";
import { TrendChart } from "@/components/TrendChart";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AddTransaction } from "@/pages/AddTransaction";
import { Reports } from "@/pages/Reports";
import { Profile } from "@/pages/Profile";
import { useTransactions } from "@/hooks/useTransactions";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { getTransactionStats } = useTransactions();
  const stats = getTransactionStats();

  // Calculate monthly change (mock calculation)
  const monthlyChange = stats.income - stats.expense;
  const monthlyChangePercent = stats.income > 0 ? ((monthlyChange / stats.income) * 100) : 0;

  const balanceData = {
    balance: stats.balance,
    monthlyChange,
    monthlyChangePercent,
  };

  const quickStatsData = {
    income: stats.income,
    expense: stats.expense,
    savings: stats.savings,
  };

  const recentTransactions = [
    {
      id: '1',
      title: 'Belanja Groceries',
      category: 'Makanan',
      amount: -350000,
      type: 'expense' as const,
      date: '2024-01-15',
      icon: 'food',
    },
    {
      id: '2',
      title: 'Gaji Bulanan',
      category: 'Gaji',
      amount: 8500000,
      type: 'income' as const,
      date: '2024-01-01',
      icon: 'other',
    },
    {
      id: '3',
      title: 'Bensin Motor',
      category: 'Transport',
      amount: -75000,
      type: 'expense' as const,
      date: '2024-01-14',
      icon: 'transport',
    },
    {
      id: '4',
      title: 'Coffee Shop',
      category: 'F&B',
      amount: -45000,
      type: 'expense' as const,
      date: '2024-01-13',
      icon: 'coffee',
    },
  ];

  const expenseData = [
    { category: 'Makanan', amount: 2100000, color: 'hsl(var(--destructive))' },
    { category: 'Transport', amount: 850000, color: 'hsl(var(--warning))' },
    { category: 'Hiburan', amount: 650000, color: 'hsl(var(--accent))' },
    { category: 'Belanja', amount: 1200000, color: 'hsl(var(--primary))' },
    { category: 'Tagihan', amount: 1450000, color: 'hsl(var(--success))' },
  ];

  const trendData = [
    { month: 'Agt', balance: 12500000, income: 8000000, expense: 5500000 },
    { month: 'Sep', balance: 13200000, income: 8200000, expense: 5800000 },
    { month: 'Okt', balance: 14100000, income: 8300000, expense: 6000000 },
    { month: 'Nov', balance: 14800000, income: 8400000, expense: 6200000 },
    { month: 'Des', balance: 15300000, income: 8500000, expense: 6100000 },
    { month: 'Jan', balance: 15750000, income: 8500000, expense: 6250000 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="pt-8 pb-2">
              <h1 className="text-2xl font-bold text-foreground">Selamat datang!</h1>
              <p className="text-muted-foreground">Kelola keuangan Anda dengan mudah</p>
            </div>

            {/* Balance Card */}
            <BalanceCard {...balanceData} />

            {/* Quick Stats */}
            <QuickStats {...quickStatsData} />

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <ExpenseChart data={expenseData} />
              <TrendChart data={trendData} />
            </div>

            {/* Recent Transactions */}
            <RecentTransactions transactions={recentTransactions} />
          </div>
        );
      case 'add':
        return <AddTransaction />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4">
        {renderContent()}
      </div>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
