
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
  bankAccount: number;
  savings: number;
  updateBankAccount: (amount: number) => void;
  updateSavings: (amount: number) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  console.log('BudgetProvider rendering');
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bankAccount, setBankAccount] = useState<number>(0);
  const [savings, setSavings] = useState<number>(0);
  const budgetData = useBudgetData(transactions, bankAccount + savings);

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

  // Load account balances from localStorage on mount
  React.useEffect(() => {
    try {
      const savedBalances = localStorage.getItem('account_balances');
      if (savedBalances) {
        const parsed = JSON.parse(savedBalances);
        setBankAccount(parsed.bankAccount || 0);
        setSavings(parsed.savings || 0);
      }
    } catch (error) {
      console.error('Failed to load account balances from localStorage:', error);
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

  // Save account balances to localStorage when they change
  React.useEffect(() => {
    try {
      localStorage.setItem('account_balances', JSON.stringify({
        bankAccount,
        savings
      }));
    } catch (error) {
      console.error('Failed to save account balances to localStorage:', error);
    }
  }, [bankAccount, savings]);

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
    // Clear previous transactions and replace with new ones
    setTransactions(newTransactions);
    toast.success(`Loaded ${newTransactions.length} transactions (previous data cleared)`);
  };

  const updateBankAccount = (amount: number) => {
    setBankAccount(amount);
    toast.success('Bank account balance updated');
  };

  const updateSavings = (amount: number) => {
    setSavings(amount);
    toast.success('Savings balance updated');
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
      bankAccount,
      savings,
      updateBankAccount,
      updateSavings,
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  console.log('useBudget called, BudgetContext:', BudgetContext);
  const context = useContext(BudgetContext);
  console.log('Context value:', context);
  if (context === undefined) {
    console.error('useBudget must be used within a BudgetProvider - context is undefined');
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
