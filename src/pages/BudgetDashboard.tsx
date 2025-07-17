import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { DollarSign, CalendarDays } from "lucide-react";
import DashboardCharts from "@/components/budget/DashboardCharts";
import FinancialSummary from "@/components/budget/FinancialSummary";
import TransactionTable from "@/components/budget/TransactionTable";
import CSVUpload from "@/components/budget/CSVUpload";
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
            <DollarSign className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Budget Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate('/budget-calendar')}
            >
              <CalendarDays className="w-4 h-4" />
              Calendar View
            </Button>
            
            <CSVUpload onTransactionsLoaded={handleTransactionsLoaded} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <DashboardCharts />
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