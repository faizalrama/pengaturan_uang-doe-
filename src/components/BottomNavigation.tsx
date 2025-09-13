import { Home, Plus, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
    },
    {
      id: 'add',
      label: 'Tambah',
      icon: Plus,
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: BarChart3,
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-large">
      <div className="grid grid-cols-4 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-2 transition-all duration-200",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-all duration-200",
              activeTab === tab.id
                ? "bg-primary/10 scale-110"
                : "hover:bg-muted"
            )}>
              <tab.icon className={cn(
                "h-5 w-5 transition-all duration-200",
                activeTab === tab.id && "scale-110"
              )} />
            </div>
            <span className={cn(
              "text-xs mt-1 font-medium transition-all duration-200",
              activeTab === tab.id && "scale-105"
            )}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};