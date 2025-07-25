
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import DashboardCharts from "@/components/budget/DashboardCharts";
import FinancialSummary from "@/components/budget/FinancialSummary";
import CurrentBalance from "@/components/budget/CurrentBalance";
import TransactionTable from "@/components/budget/TransactionTable";
import CSVUpload from "@/components/budget/CSVUpload";
import RecalculateDates from "@/components/budget/RecalculateDates";
import { useBudget } from '@/contexts/BudgetContext';

const BudgetDashboard = () => {
  const navigate = useNavigate();
  const { addTransactions } = useBudget();
  
  const handleTransactionsLoaded = (newTransactions: any[]) => {
    addTransactions(newTransactions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 text-green-600 font-bold text-2xl flex items-center justify-center">€</span>
            <h1 className="text-3xl font-bold text-gray-800">Budget Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 text-lg font-semibold"
              onClick={() => navigate('/budget-calendar')}
              size="lg"
            >
              <CalendarDays className="w-5 h-5" />
              Calendar View
            </Button>
            
            <div className="flex items-center gap-2">
              <CSVUpload onTransactionsLoaded={handleTransactionsLoaded} />
              <RecalculateDates />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-2">
            <DashboardCharts />
          </div>
          <CurrentBalance />
          <FinancialSummary />
        </div>
        
        <div className="mb-8">
          <TransactionTable />
        </div>
      </div>
    </div>
  );
};

export default BudgetDashboard;
