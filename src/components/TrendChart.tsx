import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

interface TrendData {
  month: string;
  balance: number;
  income: number;
  expense: number;
}

interface TrendChartProps {
  data: TrendData[];
}

export const TrendChart = ({ data }: TrendChartProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-medium">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-soft">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tren Keuangan</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                name="Saldo"
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 3 }}
                name="Pemasukan"
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 3 }}
                name="Pengeluaran"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};