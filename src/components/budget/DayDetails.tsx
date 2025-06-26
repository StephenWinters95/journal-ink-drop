
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import type { DayBalance } from "@/types/budget";

interface DayDetailsProps {
  selectedDate: Date;
  selectedDayData: DayBalance | undefined;
  transactionsCount: number;
}

const DayDetails = ({ selectedDate, selectedDayData, transactionsCount }: DayDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {format(selectedDate, 'MMMM d, yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedDayData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-600">Income</p>
                <p className="text-lg font-bold text-green-600">
                  ${selectedDayData.dailyIncome.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-lg font-bold text-red-600">
                  ${selectedDayData.dailyExpenses.toFixed(2)}
                </p>
              </div>
              <div className={`text-center p-4 rounded-lg ${
                selectedDayData.balance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'
              }`}>
                <DollarSign className={`w-6 h-6 mx-auto mb-2 ${
                  selectedDayData.balance >= 0 ? 'text-blue-600' : 'text-yellow-600'
                }`} />
                <p className="text-sm text-gray-600">Balance</p>
                <p className={`text-lg font-bold ${
                  selectedDayData.balance >= 0 ? 'text-blue-600' : 'text-yellow-600'
                }`}>
                  ${selectedDayData.balance.toFixed(2)}
                </p>
              </div>
            </div>

            {selectedDayData.transactions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Transactions</h4>
                <div className="space-y-2">
                  {selectedDayData.transactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{transaction.description}</span>
                      <span className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {transactionsCount === 0 
              ? 'Upload a CSV file to see budget data'
              : 'No transactions for this date'
            }
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DayDetails;
