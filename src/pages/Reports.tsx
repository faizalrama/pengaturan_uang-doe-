import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { useTransactions } from "@/hooks/useTransactions";

export const Reports = () => {
  const { transactions, stats } = useTransactions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate expense by category
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const expenseChartData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: ((amount / stats.expense) * 100).toFixed(1)
  }));

  // Generate monthly trend data (mock for demonstration)
  const trendData = [
    { month: 'Agt', balance: 12500000, income: 8000000, expense: 5500000 },
    { month: 'Sep', balance: 13200000, income: 8200000, expense: 5800000 },
    { month: 'Okt', balance: 14100000, income: 8300000, expense: 6000000 },
    { month: 'Nov', balance: 14800000, income: 8400000, expense: 6200000 },
    { month: 'Des', balance: 15300000, income: 8500000, expense: 6100000 },
    { month: 'Jan', balance: stats.balance, income: stats.income, expense: stats.expense },
  ];

  const categoryColors = [
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    'hsl(var(--destructive))',
    'hsl(var(--warning))',
    'hsl(var(--success))',
    'hsl(var(--muted-foreground))',
  ];

  const pieChartData = expenseChartData.map((item, index) => ({
    ...item,
    fill: categoryColors[index % categoryColors.length]
  }));

  const largestExpenseCategory = expenseChartData.reduce((max, current) =>
    current.amount > max.amount ? current : max
  , { category: '', amount: 0, percentage: '0' });

  // 50/30/20 budget recommendation
  const recommendedBudget = {
    needs: stats.income * 0.5, // 50% for needs
    wants: stats.income * 0.3, // 30% for wants
    savings: stats.income * 0.2, // 20% for savings
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="pt-8 pb-2">
        <h1 className="text-2xl font-bold text-foreground">Laporan Keuangan</h1>
        <p className="text-muted-foreground">Analisis lengkap keuangan Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pemasukan</p>
                <p className="text-sm font-semibold text-success">{formatCurrency(stats.income)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pengeluaran</p>
                <p className="text-sm font-semibold text-destructive">{formatCurrency(stats.expense)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/10">
                <DollarSign className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Tabungan</p>
                <p className="text-sm font-semibold text-accent">{formatCurrency(stats.savings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo Akhir</p>
                <p className="text-sm font-semibold text-primary">{formatCurrency(stats.balance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Expense by Category Pie Chart */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {expenseChartData.slice(0, 3).map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: categoryColors[index] }}
                        />
                        <span>{item.category}</span>
                      </div>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">Belum ada data pengeluaran</p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend Line Chart */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Tren Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis hide />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Comparison Bar Chart */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Perbandingan Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          {expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={expenseChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" fontSize={12} width={80} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Belum ada data untuk ditampilkan</p>
          )}
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <div className="grid gap-4">
        {/* Largest Expense Category */}
        {largestExpenseCategory.amount > 0 && (
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Kategori Pengeluaran Terbesar</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {largestExpenseCategory.category} - {largestExpenseCategory.percentage}% dari total pengeluaran
                  </p>
                </div>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  {formatCurrency(largestExpenseCategory.amount)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget Recommendation */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Rekomendasi Budget 50/30/20
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Kebutuhan (50%)</span>
              <span className="text-sm font-medium">{formatCurrency(recommendedBudget.needs)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Keinginan (30%)</span>
              <span className="text-sm font-medium">{formatCurrency(recommendedBudget.wants)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tabungan (20%)</span>
              <span className="text-sm font-medium">{formatCurrency(recommendedBudget.savings)}</span>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 Tip: Alokasikan 50% pendapatan untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan.
                Tabungan saat ini: {((stats.savings / stats.income) * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};