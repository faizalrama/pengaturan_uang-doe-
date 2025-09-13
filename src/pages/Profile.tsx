import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Bell, 
  Palette, 
  Database,
  Moon,
  Sun,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NotificationSettings } from "@/components/NotificationSettings";
import { saveSettings, loadSettings, applyDarkMode, AppSettings } from "@/lib/settings";
import { useTransactions } from "@/hooks/useTransactions";

export const Profile = () => {
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { transactions } = useTransactions();

  // Load settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const loadedSettings = await loadSettings();
      setSettings(loadedSettings);
      applyDarkMode(loadedSettings.isDarkMode);
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'isDarkMode') {
      applyDarkMode(value as boolean);
    }
  };

  const handleSaveSettings = async () => {
    if (settings.savingsTarget === undefined || settings.language === undefined || settings.isDarkMode === undefined) {
      toast({ title: "Error", description: "Settings not loaded yet.", variant: "destructive" });
      return;
    }
    try {
      await saveSettings(settings as AppSettings);
      toast({ title: "Pengaturan berhasil disimpan" });
    } catch (error) {
      toast({ title: "Gagal menyimpan pengaturan", variant: "destructive" });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const savingsThisMonth = useMemo(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    // Adjust for timezone differences by comparing dates as strings
    const firstDayString = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-01`;

    return transactions
      .filter(t => t.type === 'savings' && t.date >= firstDayString)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="pt-8 pb-2">
        <h1 className="text-2xl font-bold text-foreground">Profil & Pengaturan</h1>
        <p className="text-muted-foreground">Kelola preferensi dan target keuangan Anda</p>
      </div>

      {/* Savings Target */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Target Tabungan Bulanan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="savings-target">Target Bulanan (Rp)</Label>
            <Input
              id="savings-target"
              type="number"
              value={settings.savingsTarget || 0}
              onChange={(e) => handleSettingChange('savingsTarget', Number(e.target.value))}
              placeholder="Masukkan target tabungan"
            />
            <p className="text-sm text-muted-foreground">Target saat ini: {formatCurrency(settings.savingsTarget || 0)}</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Progress Bulan Ini</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(savingsThisMonth)} / {formatCurrency(settings.savingsTarget || 0)}</p>
            </div>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              {((savingsThisMonth / (settings.savingsTarget || 1)) * 100).toFixed(0)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Pengaturan Notifikasi</CardTitle></CardHeader>
        <CardContent className="space-y-4"><p className="text-center text-muted-foreground py-4">Pengaturan notifikasi akan tersedia di versi aplikasi native.</p></CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />Tampilan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Mode Gelap</p>
              <p className="text-xs text-muted-foreground">Aktifkan tema gelap untuk kenyamanan mata</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={settings.isDarkMode || false}
                onCheckedChange={(checked) => handleSettingChange('isDarkMode', checked)}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bahasa</Label>
            <Select value={settings.language || 'id'} onValueChange={(value) => handleSettingChange('language', value as 'id' | 'en')}>
              <SelectTrigger><SelectValue placeholder="Pilih bahasa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                <SelectItem value="en" disabled>🇺🇸 English (coming soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" />Manajemen Data</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground text-center">Fitur backup dan restore akan datang segera.</p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="pt-4">
        <Button onClick={handleSaveSettings} className="w-full" size="lg">Simpan Pengaturan</Button>
      </div>
    </div>
  );
};