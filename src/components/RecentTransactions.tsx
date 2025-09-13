import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Coffee, ShoppingBag, Car, Home, Utensils, MoreHorizontal } from "lucide-react";

interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  icon: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    coffee: Coffee,
    shopping: ShoppingBag,
    transport: Car,
    home: Home,
    food: Utensils,
    other: MoreHorizontal,
  };
  return icons[iconName] || MoreHorizontal;
};

export const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-soft">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
          <Button variant="ghost" size="sm" className="text-primary">
            Lihat Semua
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction) => {
            const IconComponent = getIcon(transaction.icon);
            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'expense' ? 'bg-destructive-light' : 'bg-success-light'
                  }`}>
                    <IconComponent className={`h-4 w-4 ${
                      transaction.type === 'expense' ? 'text-destructive' : 'text-success'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'expense' ? 'text-destructive' : 'text-success'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};