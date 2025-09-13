import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BalanceCardProps {
  balance: number;
  monthlyChange: number;
  monthlyChangePercent: number;
}

export const BalanceCard = ({ balance, monthlyChange, monthlyChangePercent }: BalanceCardProps) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-primary border-0 shadow-large text-primary-foreground">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium opacity-90">Total Saldo</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="text-primary-foreground hover:bg-white/10"
          >
            {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="mb-4">
          <p className="text-3xl font-bold">
            {showBalance ? formatCurrency(balance) : "••••••••"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            monthlyChange >= 0 
              ? 'bg-success/20 text-success-foreground' 
              : 'bg-destructive/20 text-destructive-foreground'
          }`}>
            <TrendingUp className="h-3 w-3" />
            <span>{monthlyChangePercent > 0 ? '+' : ''}{monthlyChangePercent}%</span>
          </div>
          <span className="text-xs opacity-75">
            {monthlyChange >= 0 ? '+' : ''}{formatCurrency(monthlyChange)} bulan ini
          </span>
        </div>
      </div>
    </Card>
  );
};