import { useState, useMemo } from "react";
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
  const { transactions, stats } = useTransactions();

  // This calculation should ideally be based on a specific period (e.g., this month)
  // For now, it reflects all-time stats.
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

  const categoryColors = [
    'hsl(var(--destructive))',
    'hsl(var(--warning))',
    'hsl(var(--accent))',
    'hsl(var(--primary))',
    'hsl(var(--success))',
  ];

  const expenseData = useMemo(() => {
    const expenseByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expenseByCategory)
      .map(([category, amount], index) => ({
        category,
        amount,
        color: categoryColors[index % categoryColors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const trendData = useMemo(() => {
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') monthlyData[month].income += t.amount;
      if (t.type === 'expense') monthlyData[month].expense += t.amount;
    });

    let cumulativeBalance = 0;
    return Object.entries(monthlyData).map(([month, data]) => {
        cumulativeBalance += data.income - data.expense;
        return {
            month,
            balance: cumulativeBalance,
            income: data.income,
            expense: data.expense,
        }
    }).slice(-6); // Show last 6 months
  }, [transactions]);

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
            <RecentTransactions transactions={transactions} />
          </div>
        );
      case 'add':
        return <AddTransaction setActiveTab={setActiveTab} />;
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
