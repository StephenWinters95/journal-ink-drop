import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from "sonner";
import { useBudgetData } from '@/hooks/useBudgetData';
import type { BudgetTransaction } from '@/types/budget';

interface BudgetContextType {
  transactions: BudgetTransaction[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  addTransaction: (transaction: BudgetTransaction) => void;
  updateTransaction: (transaction: BudgetTransaction) => void;
  deleteTransaction: (transactionId: string) => void;
  addTransactions: (transactions: BudgetTransaction[]) => void;
  budgetData: ReturnType<typeof useBudgetData>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  console.log('BudgetProvider rendering');
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const budgetData = useBudgetData(transactions);
  
  console.log('BudgetProvider state:', { transactions: transactions.length, selectedDate, budgetData });

  // Load transactions from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('budget_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const restored = parsed.map((t: any) => ({
          ...t,
          startDate: new Date(t.startDate),
          nextDueDate: t.nextDueDate ? new Date(t.nextDueDate) : undefined
        }));
        setTransactions(restored);
      }
    } catch (error) {
      console.error('Failed to load transactions from localStorage:', error);
    }
  }, []);

  // Save transactions to localStorage when they change
  React.useEffect(() => {
    try {
      localStorage.setItem('budget_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transactions to localStorage:', error);
    }
  }, [transactions]);

  const addTransaction = (transaction: BudgetTransaction) => {
    setTransactions(prev => [...prev, transaction]);
    toast.success('Transaction added successfully');
  };

  const updateTransaction = (transaction: BudgetTransaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === transaction.id ? transaction : t)
    );
    toast.success('Transaction updated successfully');
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    toast.success('Transaction deleted successfully');
  };

  const addTransactions = (newTransactions: BudgetTransaction[]) => {
    setTransactions(prev => [...prev, ...newTransactions]);
    toast.success(`Added ${newTransactions.length} transactions`);
  };

  return (
    <BudgetContext.Provider value={{
      transactions,
      selectedDate,
      setSelectedDate,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addTransactions,
      budgetData,
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  console.log('useBudget hook called');
  const context = useContext(BudgetContext);
  console.log('Context value:', context);
  if (context === undefined) {
    console.error('BudgetContext is undefined - provider not found');
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}