import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ExpenseData {
  category: string;
  amount: number;
  color: string;
}

interface ExpenseChartProps {
  data: ExpenseData[];
}

export const ExpenseChart = ({ data }: ExpenseChartProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-medium">
          <p className="font-medium text-sm">{data.category}</p>
          <p className="text-primary font-semibold">{formatCurrency(data.amount)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={index} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-soft">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Kategori Pengeluaran</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};