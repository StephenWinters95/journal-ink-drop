
import { useState, useEffect } from 'react';
import { addDays, addWeeks, addMonths, addYears, isSameDay, format } from "date-fns";
import { calculateNextDueDate } from "@/utils/dateCalculations";
import type { BudgetTransaction, BudgetItem, DayBalance } from "@/types/budget";

export const useBudgetData = (transactions: BudgetTransaction[], startingBalance: number = 0) => {
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [dailyBalances, setDailyBalances] = useState<Map<string, DayBalance>>(new Map());

  const generateBudgetData = (transactions: BudgetTransaction[]): BudgetItem[] => {
    const items: BudgetItem[] = [];
    const endDate = addYears(new Date(), 1);

    transactions.forEach(transaction => {
      // Use nextDueDate if available, otherwise calculate it
      let currentDate = transaction.nextDueDate 
        ? new Date(transaction.nextDueDate)
        : calculateNextDueDate(transaction.type, transaction.frequency, new Date(transaction.startDate));
      
      let itemCount = 0;
      const maxItems = 100;

      while (currentDate <= endDate && itemCount < maxItems) {
        items.push({
          date: new Date(currentDate),
          amount: transaction.amount,
          description: transaction.title,
          type: transaction.type,
          transactionId: transaction.id
        });

        // Calculate next occurrence based on frequency
        switch (transaction.frequency) {
          case 'Weekly':
            currentDate = addWeeks(currentDate, 1);
            break;
          case 'Fortnightly':
            currentDate = addWeeks(currentDate, 2);
            break;
          case 'Monthly':
            currentDate = addMonths(currentDate, 1);
            break;
          case 'Annual':
            currentDate = addYears(currentDate, 1);
            break;
          case 'One-time':
            currentDate = addYears(currentDate, 2); // Break the loop
            break;
        }
        itemCount++;
      }
    });

    return items;
  };

  useEffect(() => {
    const generatedData = generateBudgetData(transactions);
    setBudgetData(generatedData);
  }, [transactions]);

  useEffect(() => {
    const balances = new Map<string, DayBalance>();
    let runningBalance = startingBalance; // Start with the user's current balance
    
    const sortedData = [...budgetData].sort((a, b) => a.date.getTime() - b.date.getTime());
    const startDate = sortedData[0]?.date || new Date();
    const endDate = addDays(new Date(), 365);
    
    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate = addDays(currentDate, 1)) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const dayTransactions = sortedData.filter(item => isSameDay(item.date, currentDate));
      
      const dailyIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dailyExpenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      runningBalance += dailyIncome - dailyExpenses;
      
      balances.set(dateKey, {
        date: new Date(currentDate),
        balance: runningBalance,
        dailyIncome,
        dailyExpenses,
        transactions: dayTransactions
      });
    }
    
    setDailyBalances(balances);
  }, [budgetData, startingBalance]);

  return { budgetData, dailyBalances };
};
