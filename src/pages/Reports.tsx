import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { selectQuery } from "@/lib/database";
import { get503020Budget, calculateMovingAverage, BudgetRecommendation } from "@/lib/budgetHelper";
import { Transaction } from "@/types/transaction";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ReportStats = {
  income: number;
  expense: number;
  savings: number;
  balance: number;
};

type ExpenseByCategory = {
  category: string;
  amount: number;
};

export const Reports = () => {
  const [dateRange, setDateRange] = useState('this_month');
  const [stats, setStats] = useState<ReportStats>({ income: 0, expense: 0, savings: 0, balance: 0 });
  const [expenseByCategory, setExpenseByCategory] = useState<ExpenseByCategory[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<BudgetRecommendation>({ needs: 0, wants: 0, savings: 0 });

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    let startDate, endDate = today.toISOString().split('T')[0];

    if (dateRange === 'this_month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    } else if (dateRange === 'last_3_months') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split('T')[0];
    } else { // 'all_time'
      startDate = '1970-01-01';
    }
    return { startDate, endDate };
  }, [dateRange]);

  useEffect(() => {
    const fetchReportData = () => {
      // Fetch aggregated stats
      const incomeResult = selectQuery<{ total: number }>(`SELECT SUM(amount) as total FROM transactions WHERE type = 'income' AND date BETWEEN ? AND ?`, [startDate, endDate])[0]?.total || 0;
      const expenseResult = selectQuery<{ total: number }>(`SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ?`, [startDate, endDate])[0]?.total || 0;
      const savingsResult = selectQuery<{ total: number }>(`SELECT SUM(amount) as total FROM transactions WHERE type = 'savings' AND date BETWEEN ? AND ?`, [startDate, endDate])[0]?.total || 0;

      setStats({
        income: incomeResult,
        expense: expenseResult,
        savings: savingsResult,
        balance: incomeResult - expenseResult - savingsResult
      });

      // Fetch expenses grouped by category
      const expenseData = selectQuery<ExpenseByCategory>(`SELECT category, SUM(amount) as amount FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ? GROUP BY category ORDER BY amount DESC`, [startDate, endDate]);
      setExpenseByCategory(expenseData);

      // Fetch all transactions for trend chart
      const allTrans = selectQuery<Transaction>(`SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date ASC`, [startDate, endDate]);
      setAllTransactions(allTrans);

      // Calculate budget
      setBudget(get503020Budget(incomeResult));
    };

    fetchReportData();
  }, [startDate, endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const trendData = useMemo(() => {
    return calculateMovingAverage(allTransactions, 7).map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
    }));
  }, [allTransactions]);

  const categoryColors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--muted-foreground))'];
  const pieChartData = expenseByCategory.map((item, index) => ({ name: item.category, value: item.amount, fill: categoryColors[index % categoryColors.length] }));
  const largestExpenseCategory = expenseByCategory[0] || null;

  return (
    <div className="space-y-6 pb-20">
      <div className="pt-8 pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan Keuangan</h1>
          <p className="text-muted-foreground">Analisis lengkap keuangan Anda</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih rentang waktu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">Bulan Ini</SelectItem>
            <SelectItem value="last_3_months">3 Bulan Terakhir</SelectItem>
            <SelectItem value="all_time">Semua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-card border-0 shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-full bg-success/10"><TrendingUp className="h-4 w-4 text-success" /></div><div><p className="text-xs text-muted-foreground">Total Pemasukan</p><p className="text-sm font-semibold text-success">{formatCurrency(stats.income)}</p></div></div></CardContent></Card>
        <Card className="bg-gradient-card border-0 shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-full bg-destructive/10"><TrendingDown className="h-4 w-4 text-destructive" /></div><div><p className="text-xs text-muted-foreground">Total Pengeluaran</p><p className="text-sm font-semibold text-destructive">{formatCurrency(stats.expense)}</p></div></div></CardContent></Card>
        <Card className="bg-gradient-card border-0 shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-full bg-accent/10"><DollarSign className="h-4 w-4 text-accent" /></div><div><p className="text-xs text-muted-foreground">Total Tabungan</p><p className="text-sm font-semibold text-accent">{formatCurrency(stats.savings)}</p></div></div></CardContent></Card>
        <Card className="bg-gradient-card border-0 shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-full bg-primary/10"><Target className="h-4 w-4 text-primary" /></div><div><p className="text-xs text-muted-foreground">Saldo Akhir</p><p className="text-sm font-semibold text-primary">{formatCurrency(stats.balance)}</p></div></div></CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-0 shadow-soft"><CardHeader><CardTitle className="text-lg">Pengeluaran per Kategori</CardTitle></CardHeader><CardContent>{pieChartData.length > 0 ? (<><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">{pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Pie><Tooltip formatter={(value) => formatCurrency(Number(value))} /></PieChart></ResponsiveContainer><div className="mt-4 space-y-2">{expenseByCategory.slice(0, 3).map((item, index) => (<div key={item.category} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[index] }} /><span>{item.category}</span></div><span className="font-medium">{((item.amount / stats.expense) * 100).toFixed(0)}%</span></div>))}</div></>) : (<p className="text-center text-muted-foreground py-8">Belum ada data pengeluaran</p>)}</CardContent></Card>
        <Card className="bg-gradient-card border-0 shadow-soft"><CardHeader><CardTitle className="text-lg">Tren Pengeluaran (7-Day Avg)</CardTitle></CardHeader><CardContent>{trendData.length > 0 ? (<ResponsiveContainer width="100%" height={200}><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="date" fontSize={12} /><YAxis hide /><Tooltip formatter={(value) => formatCurrency(Number(value))} labelStyle={{ color: 'hsl(var(--foreground))' }} /><Line type="monotone" dataKey="average" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} /></LineChart></ResponsiveContainer>) : (<p className="text-center text-muted-foreground py-8">Data tidak cukup untuk tren</p>)}</CardContent></Card>
      </div>

      <Card className="bg-gradient-card border-0 shadow-soft"><CardHeader><CardTitle className="text-lg">Perbandingan Pengeluaran</CardTitle></CardHeader><CardContent>{expenseByCategory.length > 0 ? (<ResponsiveContainer width="100%" height={250}><BarChart data={expenseByCategory} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis type="number" hide /><YAxis dataKey="category" type="category" fontSize={12} width={80} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>) : (<p className="text-center text-muted-foreground py-8">Belum ada data untuk ditampilkan</p>)}</CardContent></Card>

      {/* Insights & Recommendations */}
      <div className="grid gap-4">
        {largestExpenseCategory && (<Card className="bg-gradient-card border-0 shadow-soft"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Kategori Pengeluaran Terbesar</p><p className="text-xs text-muted-foreground mt-1">{largestExpenseCategory.category} - {stats.expense > 0 ? ((largestExpenseCategory.amount / stats.expense) * 100).toFixed(0) : 0}% dari total</p></div><Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">{formatCurrency(largestExpenseCategory.amount)}</Badge></div></CardContent></Card>)}
        <Card className="bg-gradient-card border-0 shadow-soft"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Rekomendasi Budget 50/30/20</CardTitle></CardHeader><CardContent className="space-y-3">{stats.income > 0 ? (<><div className="flex items-center justify-between"><span className="text-sm">Kebutuhan (50%)</span><span className="text-sm font-medium">{formatCurrency(budget.needs)}</span></div><div className="flex items-center justify-between"><span className="text-sm">Keinginan (30%)</span><span className="text-sm font-medium">{formatCurrency(budget.wants)}</span></div><div className="flex items-center justify-between"><span className="text-sm">Tabungan (20%)</span><span className="text-sm font-medium">{formatCurrency(budget.savings)}</span></div><div className="mt-4 p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">💡 Pengeluaran (Kebutuhan + Keinginan) Anda saat ini adalah {formatCurrency(stats.expense)} dari budget {formatCurrency(budget.needs + budget.wants)}.</p></div></>) : (<p className="text-center text-muted-foreground py-4">Masukkan data pemasukan untuk melihat rekomendasi.</p>)}</CardContent></Card>
      </div>
    </div>
  );
};