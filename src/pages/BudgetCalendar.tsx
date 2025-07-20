
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LayoutDashboard } from "lucide-react";
import { format, isBefore, isAfter, isToday } from "date-fns";
import { toast } from "sonner";
import { useBudget } from '@/contexts/BudgetContext';
import ForwardTransactionView from '@/components/budget/ForwardTransactionView';
import type { BudgetTransaction } from "@/types/budget";

const BudgetCalendar = () => {
  console.log('BudgetCalendar component rendering');
  const navigate = useNavigate();
  console.log('About to call useBudget hook');
  const { 
    transactions, 
    selectedDate, 
    setSelectedDate,
    updateTransaction,
    deleteTransaction,
    budgetData: { budgetData, dailyBalances },
    bankAccount,
    savings
  } = useBudget();
  console.log('useBudget hook completed successfully');
  
  const [editingTransaction, setEditingTransaction] = useState<BudgetTransaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditTransaction = (transaction: BudgetTransaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleSaveTransaction = (updatedTransaction: BudgetTransaction) => {
    updateTransaction(updatedTransaction);
    setIsDialogOpen(false);
    setEditingTransaction(null);
  };

  // Use only bank account balance as current balance (excluding savings)
  const currentBalance = bankAccount;

  // Calculate running balance for calendar display (aligned with ForwardTransactionView)
  const calculateRunningBalance = (date: Date) => {
    let runningBalance = currentBalance;
    
    // Get all transactions up to and including this date
    const transactionsUpToDate = budgetData
      .filter(item => !isAfter(item.date, date))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Apply each transaction to the running balance
    transactionsUpToDate.forEach(transaction => {
      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
    });
    
    return runningBalance;
  };

  // Custom day content to show balance above each day
  const DayContent = ({ date }: { date: Date }) => {
    const balance = calculateRunningBalance(date);
    
    // Only show balance for dates that have transactions or are today/future
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayData = dailyBalances.get(dateKey);
    const hasTransactions = dayData && dayData.transactions.length > 0;
    
    return (
      <div className="flex flex-col items-center">
        {(hasTransactions || !isBefore(date, new Date())) && (
          <div className={`text-[10px] font-medium mb-0.5 ${
            balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            €{Math.abs(balance).toFixed(0)}
          </div>
        )}
        <div>{date.getDate()}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 text-green-600 font-bold text-2xl flex items-center justify-center">€</span>
            <h1 className="text-3xl font-bold text-gray-800">Calendar View</h1>
          </div>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate('/budget-dashboard')}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard View
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-xl">Budget Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full scale-110 origin-top mx-auto"
                components={{
                  DayContent: DayContent
                }}
                modifiers={{
                  hasData: (date) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const dayData = dailyBalances.get(dateKey);
                    return dayData !== undefined && dayData.transactions.length > 0;
                  },
                  positive: (date) => {
                    const balance = calculateRunningBalance(date);
                    return balance > 0;
                  },
                  negative: (date) => {
                    const balance = calculateRunningBalance(date);
                    return balance < 0;
                  }
                }}
                modifiersStyles={{
                  hasData: { fontWeight: 'bold' },
                  positive: { backgroundColor: '#dcfce7', color: '#166534' },
                  negative: { backgroundColor: '#fecaca', color: '#dc2626' }
                }}
              />
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            <ForwardTransactionView
              selectedDate={selectedDate}
              budgetData={budgetData}
              dailyBalances={dailyBalances}
              currentBalance={currentBalance}
            />
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <p>Edit form would go here</p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BudgetCalendar;
