import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
} from "@/lib/notificationHelper";
import { BellRing, BellOff } from "lucide-react";

export const NotificationSettings = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dailyReminder, setDailyReminder] = useState(true);
  const [budgetAlert, setBudgetAlert] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isNotificationSupported()) {
      setPermission(getNotificationPermission());
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    if (granted) {
      toast({
        title: "Notifikasi diaktifkan!",
        description: "Anda akan menerima pengingat dan peringatan.",
      });
      sendTestNotification();
    } else {
      toast({
        title: "Notifikasi tidak diizinkan",
        description: "Anda bisa mengubah ini di pengaturan browser Anda.",
        variant: "destructive",
      });
    }
  };

  if (!isNotificationSupported()) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg text-center">
        <p className="text-sm font-medium">Notifikasi tidak didukung</p>
        <p className="text-xs text-muted-foreground">
          Browser Anda tidak mendukung notifikasi offline.
        </p>
      </div>
    );
  }

  if (permission !== 'granted') {
    return (
      <div className="p-4 bg-muted/50 rounded-lg text-center space-y-3">
        <div className="flex justify-center">
          {permission === 'denied' ? <BellOff className="h-8 w-8 text-destructive" /> : <BellRing className="h-8 w-8 text-primary" />}
        </div>
        <p className="text-sm font-medium">
          {permission === 'denied' ? 'Notifikasi Diblokir' : 'Aktifkan Notifikasi'}
        </p>
        <p className="text-xs text-muted-foreground">
          {permission === 'denied'
            ? 'Anda telah memblokir notifikasi. Ubah di pengaturan browser untuk melanjutkan.'
            : 'Dapatkan pengingat harian dan peringatan budget langsung di perangkat Anda.'
          }
        </p>
        {permission !== 'denied' && (
          <Button onClick={handleRequestPermission} size="sm">
            Izinkan Notifikasi
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Pengingat Harian</p>
          <p className="text-xs text-muted-foreground">
            Ingatkan untuk mencatat transaksi setiap pukul 21:00.
          </p>
        </div>
        <Switch
          checked={dailyReminder}
          onCheckedChange={(checked) => {
            setDailyReminder(checked);
            if (checked) {
              scheduleDailyReminder();
              toast({ title: "Pengingat harian diaktifkan." });
            } else {
              cancelDailyReminder();
              toast({ title: "Pengingat harian dinonaktifkan." });
            }
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Peringatan Budget</p>
          <p className="text-xs text-muted-foreground">
            Peringatan ketika pengeluaran mendekati batas.
          </p>
        </div>
        <Switch
          checked={budgetAlert}
          onCheckedChange={setBudgetAlert}
          // This will be connected in the budget implementation step
        />
      </div>
      <Button onClick={sendTestNotification} variant="outline" size="sm" className="w-full">
        Kirim Notifikasi Tes
      </Button>
    </div>
  );
};
