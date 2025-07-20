
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { format, isSameDay, isAfter, isToday, isBefore } from "date-fns";
import type { BudgetItem, DayBalance } from "@/types/budget";

interface ForwardTransactionViewProps {
  selectedDate: Date;
  budgetData: BudgetItem[];
  dailyBalances: Map<string, DayBalance>;
  currentBalance: number;
}

const ForwardTransactionView = ({ 
  selectedDate, 
  budgetData, 
  dailyBalances,
  currentBalance 
}: ForwardTransactionViewProps) => {
  // Get opening balance for the selected date
  const getOpeningBalance = () => {
    if (isToday(selectedDate) || isAfter(selectedDate, new Date())) {
      // For today or future dates, use current balance
      return currentBalance;
    } else {
      // For past dates, get the balance from dailyBalances
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const dayData = dailyBalances.get(dateKey);
      return dayData?.balance || currentBalance;
    }
  };

  // Filter and sort transactions from selected date onwards
  const forwardTransactions = budgetData
    .filter(item => !isBefore(item.date, selectedDate))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group transactions by date
  const groupedTransactions = forwardTransactions.reduce((groups, transaction) => {
    const dateKey = format(transaction.date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {} as Record<string, BudgetItem[]>);

  const openingBalance = getOpeningBalance();
  let runningBalance = openingBalance;

  // Calculate daily totals for each date group
  const dateGroups = Object.entries(groupedTransactions).map(([dateKey, transactions]) => {
    const date = new Date(dateKey);
    const dailyIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const dailyExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const dailyNet = dailyIncome - dailyExpenses;
    
    const startingBalanceForDay = runningBalance;
    runningBalance += dailyNet;
    
    return {
      date,
      dateKey,
      transactions,
      dailyIncome,
      dailyExpenses,
      dailyNet,
      startingBalance: startingBalanceForDay,
      endingBalance: runningBalance
    };
  });

  return (
    <div className="space-y-6">
      {/* Opening Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Forward View from {format(selectedDate, 'MMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Opening Balance</p>
            <p className="text-xl font-bold text-blue-600">
              €{openingBalance.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Groups by Date */}
      {dateGroups.length > 0 ? (
        <div className="space-y-4">
          {dateGroups.map(({ date, dateKey, transactions, dailyIncome, dailyExpenses, dailyNet, endingBalance }) => (
            <Card key={dateKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{format(date, 'EEEE, MMM d, yyyy')}</span>
                  <span className={`text-sm font-medium ${
                    dailyNet >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dailyNet >= 0 ? '+' : ''}€{dailyNet.toFixed(2)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Daily Summary */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-green-600 font-medium">+€{dailyIncome.toFixed(2)}</p>
                    <p className="text-gray-500 text-xs">Income</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <p className="text-red-600 font-medium">-€{dailyExpenses.toFixed(2)}</p>
                    <p className="text-gray-500 text-xs">Expenses</p>
                  </div>
                  <div className={`text-center p-2 rounded ${
                    endingBalance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'
                  }`}>
                    <p className={`font-medium ${
                      endingBalance >= 0 ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      €{endingBalance.toFixed(2)}
                    </p>
                    <p className="text-gray-500 text-xs">Balance</p>
                  </div>
                </div>

                {/* Individual Transactions */}
                <div className="space-y-2">
                  {transactions.map((transaction, index) => (
                    <div
                      key={`${transaction.transactionId}-${index}`}
                      className={`flex justify-between items-center p-2 rounded border-l-4 ${
                        transaction.type === 'income'
                          ? 'bg-green-50 border-green-400'
                          : 'bg-red-50 border-red-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          transaction.type === 'income' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {transaction.description}
                        </span>
                      </div>
                      <span className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No transactions scheduled from this date onwards</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ForwardTransactionView;
