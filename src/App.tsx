
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BudgetProvider } from "./contexts/BudgetContext";
import Index from "./pages/Index";
import Journal from "./pages/Journal";
import NewEntry from "./pages/NewEntry";
import EditEntry from "./pages/EditEntry";
import BudgetCalendar from "./pages/BudgetCalendar";
import BudgetDashboard from "./pages/BudgetDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering');
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BudgetProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/journal/new" element={<NewEntry />} />
              <Route path="/journal/edit/:id" element={<EditEntry />} />
              <Route path="/budget-dashboard" element={<BudgetDashboard />} />
              <Route path="/budget-calendar" element={<BudgetCalendar />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BudgetProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
