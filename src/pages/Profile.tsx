import { useState } from "react";
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
  Globe, 
  Smartphone, 
  Database,
  Settings,
  Moon,
  Sun
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Profile = () => {
  const [savingsTarget, setSavingsTarget] = useState(5000000);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [budgetAlert, setBudgetAlert] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('id');
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSaveSettings = () => {
    // Placeholder for saving settings to local storage or database
    toast({ title: "Pengaturan berhasil disimpan" });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="pt-8 pb-2">
        <h1 className="text-2xl font-bold text-foreground">Profil & Pengaturan</h1>
        <p className="text-muted-foreground">Kelola preferensi dan target keuangan Anda</p>
      </div>

      {/* Savings Target */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Target Tabungan Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="savings-target">Target Bulanan (Rp)</Label>
            <Input
              id="savings-target"
              type="number"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(Number(e.target.value))}
              placeholder="Masukkan target tabungan"
            />
            <p className="text-sm text-muted-foreground">
              Target saat ini: {formatCurrency(savingsTarget)}
            </p>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Progress Bulan Ini</p>
              <p className="text-xs text-muted-foreground">2.250.000 / {formatCurrency(savingsTarget)}</p>
            </div>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              {((2250000 / savingsTarget) * 100).toFixed(0)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Pengaturan Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Pengingat Harian</p>
              <p className="text-xs text-muted-foreground">
                Ingatkan untuk mencatat transaksi setiap hari
              </p>
            </div>
            <Switch
              checked={dailyReminder}
              onCheckedChange={setDailyReminder}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Peringatan Budget</p>
              <p className="text-xs text-muted-foreground">
                Peringatan ketika pengeluaran mendekati batas
              </p>
            </div>
            <Switch
              checked={budgetAlert}
              onCheckedChange={setBudgetAlert}
            />
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Notifikasi Lokal</p>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Placeholder: Integrasi dengan local notification system untuk pengingat offline
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Tampilan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Mode Gelap</p>
              <p className="text-xs text-muted-foreground">
                Aktifkan tema gelap untuk kenyamanan mata
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bahasa</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih bahasa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Manajemen Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Database Lokal</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              💡 Placeholder: Semua data disimpan secara offline menggunakan SQLite/Realm
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" disabled>
                Backup Data
              </Button>
              <Button variant="outline" size="sm" disabled>
                Restore Data
              </Button>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Background Tasks</p>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Placeholder: Sinkronisasi data dan analisis otomatis di background
            </p>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Informasi Aplikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Versi Aplikasi</span>
            <Badge variant="outline">1.0.0</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Database</span>
            <Badge variant="outline">SQLite (Offline)</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Total Transaksi</span>
            <Badge variant="outline">124 transaksi</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="pt-4">
        <Button 
          onClick={handleSaveSettings}
          className="w-full"
          size="lg"
        >
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
};