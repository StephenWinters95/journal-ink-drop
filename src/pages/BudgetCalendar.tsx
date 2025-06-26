
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
        console.log('CSV content:', csv.substring(0, 200) + '...');
        
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        console.log('Total lines:', lines.length);
        
        if (lines.length < 2) {
          toast.error('CSV file must have at least 2 lines (header + data)');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        console.log('Headers found:', headers);
        
        const data: BudgetItem[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Handle CSV with quotes and commas
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          console.log(`Processing line ${i}:`, values);
          
          if (values.length < 2) {
            console.warn(`Skipping line ${i}: insufficient columns`);
            continue;
          }
          
          // Try to find date column (flexible matching)
          const dateIndex = headers.findIndex(h => 
            h.includes('date') || h.includes('time') || h.includes('day')
          );
          
          // Try to find amount column (flexible matching)
          const amountIndex = headers.findIndex(h => 
            h.includes('amount') || h.includes('value') || h.includes('money') || 
            h.includes('cost') || h.includes('price') || h.includes('sum')
          );
          
          // Try to find description column (flexible matching)
          const descriptionIndex = headers.findIndex(h => 
            h.includes('description') || h.includes('name') || h.includes('title') || 
            h.includes('item') || h.includes('detail') || h.includes('memo')
          );
          
          // Try to find type column (flexible matching)
          const typeIndex = headers.findIndex(h => 
            h.includes('type') || h.includes('category') || h.includes('kind')
          );
          
          console.log('Column indices:', { dateIndex, amountIndex, descriptionIndex, typeIndex });
          
          // If we can't find required columns, try using position-based approach
          let dateValue = '';
          let amountValue = 0;
          let description = '';
          let typeValue = '';
          
          if (dateIndex >= 0 && amountIndex >= 0) {
            dateValue = values[dateIndex];
            amountValue = parseFloat(values[amountIndex]);
            description = descriptionIndex >= 0 ? values[descriptionIndex] : 'Transaction';
            typeValue = typeIndex >= 0 ? values[typeIndex] : '';
          } else {
            // Fallback: assume first column is date, second is amount
            dateValue = values[0];
            amountValue = parseFloat(values[1]);
            description = values.length > 2 ? values[2] : 'Transaction';
            typeValue = values.length > 3 ? values[3] : '';
          }
          
          console.log('Parsed values:', { dateValue, amountValue, description, typeValue });
          
          if (isNaN(amountValue)) {
            console.warn(`Skipping line ${i}: invalid amount`);
            continue;
          }
          
          let date: Date;
          try {
            // Try different date formats
            if (dateValue.includes('/')) {
              // MM/DD/YYYY or DD/MM/YYYY
              const parts = dateValue.split('/');
              if (parts.length === 3) {
                date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
              } else {
                date = new Date(dateValue);
              }
            } else if (dateValue.includes('-')) {
              // YYYY-MM-DD
              date = new Date(dateValue);
            } else {
              date = new Date(dateValue);
            }
            
            if (isNaN(date.getTime())) {
              console.warn(`Skipping line ${i}: invalid date`);
              continue;
            }
          } catch (error) {
            console.warn(`Skipping line ${i}: date parsing error`, error);
            continue;
          }
          
          const type = typeValue.toLowerCase() === 'expense' || typeValue.toLowerCase() === 'out' || amountValue < 0 ? 'expense' : 'income';
          const amount = Math.abs(amountValue);
          
          console.log('Adding transaction:', { date, amount, description, type });
          
          data.push({
            date: startOfDay(date),
            amount,
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
        toast.success(`Successfully loaded ${data.length} transactions`);
        
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
                    <p className="font-medium mb-2">Basic Format:</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      Date,Amount,Description<br/>
                      2024-01-15,1000,Salary<br/>
                      2024-01-16,-50,Groceries
                    </code>
                  </div>
                  <div>
                    <p className="font-medium mb-2">With Type Column:</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      Date,Amount,Description,Type<br/>
                      2024-01-15,1000,Salary,income<br/>
                      2024-01-16,50,Groceries,expense
                    </code>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Supported date formats:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>YYYY-MM-DD (2024-01-15)</li>
                      <li>MM/DD/YYYY (01/15/2024)</li>
                      <li>DD/MM/YYYY (15/01/2024)</li>
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
