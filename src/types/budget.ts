
export interface BudgetTransaction {
  id: string;
  title: string;
  frequency: 'Weekly' | 'Monthly' | 'Annual' | 'One-time';
  amount: number;
  type: 'income' | 'expense';
  startDate: Date;
}

export interface BudgetItem {
  date: Date;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  transactionId: string;
}

export interface DayBalance {
  date: Date;
  balance: number;
  dailyIncome: number;
  dailyExpenses: number;
  transactions: BudgetItem[];
}
