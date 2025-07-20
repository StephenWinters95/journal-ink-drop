
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { startOfDay } from "date-fns";
import { calculateNextDueDate } from "@/utils/dateCalculations";
import { useBudget } from '@/contexts/BudgetContext';

const RecalculateDates = () => {
  const { transactions, updateTransaction } = useBudget();

  const handleRecalculate = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to recalculate');
      return;
    }

    const today = startOfDay(new Date());
    let updatedCount = 0;

    transactions.forEach((transaction) => {
      const newNextDueDate = calculateNextDueDate(
        transaction.type,
        transaction.frequency,
        today
      );

      // Update the transaction with the new due date
      updateTransaction({
        ...transaction,
        nextDueDate: newNextDueDate
      });

      updatedCount++;
    });

    toast.success(`Recalculated payment dates for ${updatedCount} transactions`);
  };

  return (
    <Button 
      onClick={handleRecalculate}
      className="bg-blue-600 hover:bg-blue-700"
      disabled={transactions.length === 0}
    >
      <Calendar className="w-4 h-4 mr-2" />
      Recalculate payment dates
    </Button>
  );
};

export default RecalculateDates;
