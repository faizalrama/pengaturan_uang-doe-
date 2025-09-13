import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickStatsProps {
  income: number;
  expense: number;
  savings: number;
}

export const QuickStats = ({ income, expense, savings }: QuickStatsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Pemasukan",
      value: income,
      icon: ArrowUpCircle,
      color: "text-success",
      bgColor: "bg-success-light",
    },
    {
      title: "Pengeluaran", 
      value: expense,
      icon: ArrowDownCircle,
      color: "text-destructive",
      bgColor: "bg-destructive-light",
    },
    {
      title: "Tabungan",
      value: savings,
      icon: Wallet,
      color: "text-accent",
      bgColor: "bg-accent-light",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4 bg-gradient-card border-0 shadow-soft">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
              <p className="text-sm font-semibold">{formatCurrency(stat.value)}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};