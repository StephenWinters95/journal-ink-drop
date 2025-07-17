
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, LayoutDashboard } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useBudget } from '@/contexts/BudgetContext';
import DayDetails from "@/components/budget/DayDetails";
import TransactionList from "@/components/budget/TransactionList";
import EditTransactionForm from "@/components/budget/EditTransactionForm";
import type { BudgetTransaction } from "@/types/budget";

const BudgetCalendar = () => {
  const navigate = useNavigate();
  const { 
    transactions, 
    selectedDate, 
    setSelectedDate,
    updateTransaction,
    deleteTransaction,
    budgetData: { dailyBalances }
  } = useBudget();
  
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

  const getSelectedDayData = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return dailyBalances.get(dateKey);
  };

  const selectedDayData = getSelectedDayData();

  // Custom day content to show balance above each day
  const DayContent = ({ date }: { date: Date }) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayData = dailyBalances.get(dateKey);
    
    return (
      <div className="flex flex-col items-center">
        {dayData && (
          <div className={`text-xs font-bold mb-1 ${
            dayData.balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ${Math.abs(dayData.balance).toFixed(0)}
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
            <DollarSign className="w-8 h-8 text-green-600" />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
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
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const dayData = dailyBalances.get(dateKey);
                    return dayData !== undefined && dayData.balance > 0;
                  },
                  negative: (date) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const dayData = dailyBalances.get(dateKey);
                    return dayData !== undefined && dayData.balance < 0;
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

          <div className="space-y-6">
            <DayDetails 
              selectedDate={selectedDate}
              selectedDayData={selectedDayData}
              transactionsCount={transactions.length}
            />

            <TransactionList
              transactions={transactions}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={deleteTransaction}
            />
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            {editingTransaction && (
              <EditTransactionForm
                transaction={editingTransaction}
                onSave={handleSaveTransaction}
                onCancel={() => setIsDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BudgetCalendar;
