import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionFormData, INCOME_CATEGORIES, EXPENSE_CATEGORIES, SAVINGS_CATEGORIES, Transaction } from "@/types/transaction";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  type: z.enum(['income', 'expense', 'savings']),
  category: z.string().min(1, "Kategori harus dipilih"),
  amount: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  notes: z.string().optional(),
  date: z.date(),
});

type FormData = z.infer<typeof formSchema>;

interface AddTransactionProps {
  setActiveTab: (tab: 'dashboard' | 'add' | 'reports' | 'profile') => void;
}

export const AddTransaction = ({ setActiveTab }: AddTransactionProps) => {
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | 'savings'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      category: '',
      amount: 0,
      notes: '',
      date: new Date(),
    },
  });

  const getCategoriesByType = (type: string) => {
    switch (type) {
      case 'income': return INCOME_CATEGORIES;
      case 'expense': return EXPENSE_CATEGORIES;
      case 'savings': return SAVINGS_CATEGORIES;
      default: return [];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const transactionData: TransactionFormData = {
        type: data.type,
        category: data.category,
        amount: data.amount,
        notes: data.notes || '',
        date: data.date,
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
        toast({ title: "Transaksi berhasil diperbarui" });
        setEditingTransaction(null);
      } else {
        await addTransaction(transactionData);
        toast({ title: "Transaksi berhasil ditambahkan" });
      }
      form.reset();
      setSelectedType('expense');
    } catch (error) {
      toast({ 
        title: "Terjadi kesalahan", 
        description: "Gagal menyimpan transaksi",
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setSelectedType(transaction.type);
    form.reset({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      notes: transaction.notes || '',
      date: new Date(transaction.date),
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast({ title: "Transaksi berhasil dihapus" });
    } catch (error) {
      toast({ 
        title: "Terjadi kesalahan", 
        description: "Gagal menghapus transaksi",
        variant: "destructive" 
      });
    }
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    form.reset();
    setSelectedType('expense');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="pt-8 pb-2">
        <h1 className="text-2xl font-bold text-foreground">
          {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
        </h1>
        <p className="text-muted-foreground">Catat pemasukan, pengeluaran, dan tabungan Anda</p>
      </div>

      {/* Transaction Form */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingTransaction ? 'Edit Transaksi' : 'Transaksi Baru'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Transaction Type */}
              <div className="space-y-2">
                <Label>Jenis Transaksi</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['income', 'expense', 'savings'] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={selectedType === type ? "default" : "outline"}
                      onClick={() => {
                        setSelectedType(type);
                        form.setValue('type', type);
                        form.setValue('category', '');
                      }}
                      className="text-sm"
                    >
                      {type === 'income' && 'Pemasukan'}
                      {type === 'expense' && 'Pengeluaran'}
                      {type === 'savings' && 'Tabungan'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getCategoriesByType(selectedType).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text"
                        inputMode="decimal"
                        placeholder="0" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers by stripping non-digit characters
                          const sanitizedValue = value.replace(/[^0-9]/g, '');
                          // Coerce to number to remove leading zeros and update the form state
                          field.onChange(Number(sanitizedValue));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tambahkan catatan..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex gap-2 pt-2">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Menyimpan...' : editingTransaction ? 'Perbarui' : 'Tambah Transaksi'}
                </Button>
                {editingTransaction && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Transaksi Terbaru</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary -mr-3" onClick={() => setActiveTab('reports')}>
            Lihat Semua
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{transaction.notes || transaction.category}</p>
                    <p className={cn(
                      "font-semibold",
                      transaction.type === 'income' && "text-success",
                      transaction.type === 'expense' && "text-destructive",
                      transaction.type === 'savings' && "text-accent"
                    )}>
                      {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{transaction.category}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(transaction)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(transaction.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Belum ada transaksi. Mulai dengan menambah transaksi pertama Anda!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};