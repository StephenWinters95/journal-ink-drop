
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Upload, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { format, isSameDay, startOfDay, addDays } from "date-fns";

interface BudgetItem {
  date: Date;
  amount: number;
  description: string;
  type: 'income' | 'expense';
}

interface DayBalance {
  date: Date;
  balance: number;
  dailyIncome: number;
  dailyExpenses: number;
  transactions: BudgetItem[];
}

const BudgetCalendar = () => {
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyBalances, setDailyBalances] = useState<Map<string, DayBalance>>(new Map());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const data: BudgetItem[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < 3) continue;
        
        const dateIndex = headers.findIndex(h => h.includes('date'));
        const amountIndex = headers.findIndex(h => h.includes('amount'));
        const descriptionIndex = headers.findIndex(h => h.includes('description') || h.includes('name'));
        const typeIndex = headers.findIndex(h => h.includes('type'));
        
        if (dateIndex === -1 || amountIndex === -1) continue;
        
        const dateValue = values[dateIndex];
        const amountValue = parseFloat(values[amountIndex]);
        const description = values[descriptionIndex] || 'Transaction';
        const typeValue = values[typeIndex]?.toLowerCase();
        
        let date: Date;
        try {
          date = new Date(dateValue);
          if (isNaN(date.getTime())) continue;
        } catch {
          continue;
        }
        
        const type = typeValue === 'expense' || amountValue < 0 ? 'expense' : 'income';
        const amount = Math.abs(amountValue);
        
        data.push({
          date: startOfDay(date),
          amount,
          description,
          type
        });
      }
      
      setBudgetData(data);
    };
    
    reader.readAsText(file);
  };

  useEffect(() => {
    if (budgetData.length === 0) return;

    const balances = new Map<string, DayBalance>();
    let runningBalance = 0;
    
    // Sort data by date
    const sortedData = [...budgetData].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Get date range from first transaction to 365 days in the future
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
  }, [budgetData]);

  const getSelectedDayData = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return dailyBalances.get(dateKey);
  };

  const selectedDayData = getSelectedDayData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Budget Calendar</h1>
          </div>
          
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="csv-upload"
            />
            <Button className="bg-green-600 hover:bg-green-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    {budgetData.length === 0 
                      ? 'Upload a CSV file to see budget data'
                      : 'No transactions for this date'
                    }
                  </p>
                )}
              </CardContent>
            </Card>

            {budgetData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>CSV Format Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">
                    Your CSV should include columns for:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Date</strong> (YYYY-MM-DD format)</li>
                    <li>• <strong>Amount</strong> (positive for income, negative for expenses)</li>
                    <li>• <strong>Description/Name</strong> (transaction description)</li>
                    <li>• <strong>Type</strong> (optional: "income" or "expense")</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCalendar;
