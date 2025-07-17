import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { useBudget } from '@/contexts/BudgetContext';

const FinancialSummary = () => {
  const { transactions, budgetData: { dailyBalances } } = useBudget();
  
  // Calculate averages
  const calculateWeeklyAverages = () => {
    // Group transactions by type
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Calculate weekly income
    const weeklyIncome = incomeTransactions.reduce((total, transaction) => {
      let weeklyAmount = 0;
      
      switch (transaction.frequency) {
        case 'Weekly':
          weeklyAmount = transaction.amount;
          break;
        case 'Monthly':
          weeklyAmount = (transaction.amount * 12) / 52;
          break;
        case 'Annual':
          weeklyAmount = transaction.amount / 52;
          break;
        case 'One-time':
          weeklyAmount = transaction.amount / 52; // Amortized over a year
          break;
      }
      
      return total + weeklyAmount;
    }, 0);
    
    // Calculate weekly expenses
    const weeklyExpenses = expenseTransactions.reduce((total, transaction) => {
      let weeklyAmount = 0;
      
      switch (transaction.frequency) {
        case 'Weekly':
          weeklyAmount = transaction.amount;
          break;
        case 'Monthly':
          weeklyAmount = (transaction.amount * 12) / 52;
          break;
        case 'Annual':
          weeklyAmount = transaction.amount / 52;
          break;
        case 'One-time':
          weeklyAmount = transaction.amount / 52; // Amortized over a year
          break;
      }
      
      return total + weeklyAmount;
    }, 0);
    
    const weeklyNet = weeklyIncome - weeklyExpenses;
    const monthlySavings = weeklyNet * 4.33; // Average weeks per month
    
    return {
      weeklyIncome,
      weeklyExpenses,
      weeklyNet,
      monthlySavings
    };
  };
  
  const { weeklyIncome, weeklyExpenses, weeklyNet, monthlySavings } = calculateWeeklyAverages();
  
  // Get current balance from today's entry in dailyBalances
  const getCurrentBalance = () => {
    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayData = dailyBalances.get(key);
    return todayData ? todayData.balance : 0;
  };
  
  const currentBalance = getCurrentBalance();
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-gray-600">Avg Weekly Income</p>
            <p className="text-lg font-bold text-green-600">${weeklyIncome.toFixed(2)}</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <p className="text-sm text-gray-600">Avg Weekly Expenses</p>
            <p className="text-lg font-bold text-red-600">${weeklyExpenses.toFixed(2)}</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Weekly Net</p>
            <p className={`text-lg font-bold ${weeklyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${weeklyNet.toFixed(2)}
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Wallet className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-gray-600">Monthly Savings</p>
            <p className={`text-lg font-bold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${monthlySavings.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;