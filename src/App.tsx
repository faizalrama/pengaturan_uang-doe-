import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useDB } from "./contexts/DBContext";
import { initDB } from "./lib/database";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const { isInitialized, setInitialized } = useDB();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        setInitialized(true);
        console.log("Database initialized successfully from App.tsx");
      } catch (err) {
        console.error("Failed to initialize database from App.tsx:", err);
        setError((err as Error).message || "An unknown error occurred");
      }
    };
    initialize();
  }, [setInitialized]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive p-4">
        <h1 className="text-2xl font-bold mb-2">Error Inisialisasi Database</h1>
        <p className="text-center mb-4">Aplikasi tidak dapat memulai karena gagal terhubung ke database lokal.</p>
        <pre className="bg-muted p-2 rounded text-xs text-destructive-foreground">{error}</pre>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Mempersiapkan database...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
