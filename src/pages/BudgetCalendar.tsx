import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Upload, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { format, isSameDay, startOfDay, addDays } from "date-fns";
import { toast } from "sonner";

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

    console.log('File selected:', file.name, file.size, 'bytes');
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        console.log('CSV content:', csv);
        
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        console.log('Total lines:', lines.length);
        
        if (lines.length === 0) {
          toast.error('CSV file is empty');
          return;
        }

        const data: BudgetItem[] = [];
        const today = startOfDay(new Date());
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          console.log(`Processing line ${i}:`, line);
          
          // Split by comma and clean up
          const parts = line.split(',').map(part => part.trim());
          console.log('Parts:', parts);
          
          if (parts.length < 2) {
            console.warn(`Skipping line ${i}: insufficient data`);
            continue;
          }
          
          const description = parts[0];
          const amountStr = parts[1];
          
          // Parse amount
          const amount = parseFloat(amountStr);
          if (isNaN(amount)) {
            console.warn(`Skipping line ${i}: invalid amount "${amountStr}"`);
            continue;
          }
          
          // Determine type based on description or amount
          const isIncome = description.toLowerCase().includes('income') || 
                          description.toLowerCase().includes('salary') || 
                          description.toLowerCase().includes('wage') ||
                          amount > 0;
          
          const type = isIncome ? 'income' : 'expense';
          const finalAmount = Math.abs(amount);
          
          console.log('Adding transaction:', { 
            date: today, 
            amount: finalAmount, 
            description, 
            type 
          });
          
          data.push({
            date: today,
            amount: finalAmount,
            description,
            type
          });
        }
        
        console.log('Total transactions processed:', data.length);
        
        if (data.length === 0) {
          toast.error('No valid transactions found in CSV file');
          return;
        }
        
        setBudgetData(data);
        toast.success(`Successfully loaded ${data.length} transactions for today`);
        
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Error parsing CSV file');
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      toast.error('Error reading file');
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

            <Card>
              <CardHeader>
                <CardTitle>CSV Format Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Simple Format (your format):</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      Daily Income,130<br/>
                      Daily Outcome,120<br/>
                      Groceries,50
                    </code>
                  </div>
                  <div>
                    <p className="font-medium mb-2">With Dates:</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      Date,Amount,Description<br/>
                      2024-01-15,1000,Salary<br/>
                      2024-01-16,-50,Groceries
                    </code>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Notes:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Items with "income" in the name are treated as income</li>
                      <li>Items with "outcome" in the name are treated as expenses</li>
                      <li>Without dates, all transactions are applied to today</li>
                      <li>Negative amounts are automatically treated as expenses</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCalendar;
