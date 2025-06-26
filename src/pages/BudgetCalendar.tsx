
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, DollarSign, TrendingUp, TrendingDown, Edit, Plus, Trash2 } from "lucide-react";
import { format, isSameDay, startOfDay, addDays, addWeeks, addMonths, addYears, parseISO } from "date-fns";
import { toast } from "sonner";

interface BudgetTransaction {
  id: string;
  title: string;
  frequency: 'Weekly' | 'Monthly' | 'Annual' | 'One-time';
  amount: number;
  type: 'income' | 'expense';
  startDate: Date;
}

interface BudgetItem {
  date: Date;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  transactionId: string;
}

interface DayBalance {
  date: Date;
  balance: number;
  dailyIncome: number;
  dailyExpenses: number;
  transactions: BudgetItem[];
}

const BudgetCalendar = () => {
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyBalances, setDailyBalances] = useState<Map<string, DayBalance>>(new Map());
  const [editingTransaction, setEditingTransaction] = useState<BudgetTransaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

        const newTransactions: BudgetTransaction[] = [];
        const today = startOfDay(new Date());
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          console.log(`Processing line ${i}:`, line);
          
          // Split by comma and clean up, handling quoted values
          const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, ''));
          console.log('Parts:', parts);
          
          if (parts.length < 3) {
            console.warn(`Skipping line ${i}: insufficient data`);
            continue;
          }
          
          const title = parts[0];
          const frequency = parts[1];
          const amountStr = parts[2];
          
          // Skip title rows (empty frequency or amount)
          if (!frequency || !amountStr || amountStr === '') {
            console.log(`Skipping title row: ${title}`);
            continue;
          }
          
          // Parse amount
          const amount = parseFloat(amountStr);
          if (isNaN(amount) || amount === 0) {
            console.warn(`Skipping line ${i}: invalid amount "${amountStr}"`);
            continue;
          }
          
          // Validate frequency
          if (!['Weekly', 'Monthly', 'Annual'].includes(frequency)) {
            console.warn(`Skipping line ${i}: invalid frequency "${frequency}"`);
            continue;
          }
          
          // Determine type - income typically has positive amounts or income-related keywords
          const isIncome = title.toLowerCase().includes('income') || 
                          title.toLowerCase().includes('earnings') || 
                          title.toLowerCase().includes('salary') ||
                          title.toLowerCase().includes('wage') ||
                          title.toLowerCase().includes('benefit') ||
                          title.toLowerCase().includes('payment') ||
                          title.toLowerCase().includes('pension') ||
                          title.toLowerCase().includes('allowance') ||
                          title.toLowerCase().includes('grant') ||
                          title.toLowerCase().includes('maintenance') ||
                          title.toLowerCase().includes('boarders') ||
                          title.toLowerCase().includes('lodgers');
          
          const type = isIncome ? 'income' : 'expense';
          const finalAmount = Math.abs(amount);
          
          console.log('Adding transaction:', { 
            title, 
            frequency, 
            amount: finalAmount, 
            type 
          });
          
          newTransactions.push({
            id: `${Date.now()}-${i}`,
            title,
            frequency: frequency as 'Weekly' | 'Monthly' | 'Annual',
            amount: finalAmount,
            type,
            startDate: today
          });
        }
        
        console.log('Total transactions processed:', newTransactions.length);
        
        if (newTransactions.length === 0) {
          toast.error('No valid transactions found in CSV file');
          return;
        }
        
        setTransactions(newTransactions);
        toast.success(`Successfully loaded ${newTransactions.length} transactions`);
        
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

  const generateBudgetData = (transactions: BudgetTransaction[]): BudgetItem[] => {
    const items: BudgetItem[] = [];
    const endDate = addYears(new Date(), 1);

    transactions.forEach(transaction => {
      let currentDate = new Date(transaction.startDate);
      let itemCount = 0;
      const maxItems = 100; // Prevent infinite loops

      while (currentDate <= endDate && itemCount < maxItems) {
        items.push({
          date: new Date(currentDate),
          amount: transaction.amount,
          description: transaction.title,
          type: transaction.type,
          transactionId: transaction.id
        });

        // Calculate next occurrence
        switch (transaction.frequency) {
          case 'Weekly':
            currentDate = addWeeks(currentDate, 1);
            break;
          case 'Monthly':
            currentDate = addMonths(currentDate, 1);
            break;
          case 'Annual':
            currentDate = addYears(currentDate, 1);
            break;
          case 'One-time':
            currentDate = addYears(currentDate, 2); // Exit loop
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

  const handleEditTransaction = (transaction: BudgetTransaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleSaveTransaction = (updatedTransaction: BudgetTransaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
    setIsDialogOpen(false);
    setEditingTransaction(null);
    toast.success('Transaction updated successfully');
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    toast.success('Transaction deleted successfully');
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
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
                    {transactions.length === 0 
                      ? 'Upload a CSV file to see budget data'
                      : 'No transactions for this date'
                    }
                  </p>
                )}
              </CardContent>
            </Card>

            {transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{transaction.title}</p>
                          <p className="text-xs text-gray-500">
                            {transaction.frequency} • ${transaction.amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            {editingTransaction && (
              <EditTransactionForm
                transaction={editingTransaction}
                onSave={handleSaveTransaction}
                onCancel={() => setIsDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const EditTransactionForm = ({ 
  transaction, 
  onSave, 
  onCancel 
}: { 
  transaction: BudgetTransaction;
  onSave: (transaction: BudgetTransaction) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: transaction.title,
    frequency: transaction.frequency,
    amount: transaction.amount.toString(),
    type: transaction.type,
    startDate: format(transaction.startDate, 'yyyy-MM-dd')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    onSave({
      ...transaction,
      title: formData.title,
      frequency: formData.frequency as 'Weekly' | 'Monthly' | 'Annual' | 'One-time',
      amount,
      type: formData.type as 'income' | 'expense',
      startDate: parseISO(formData.startDate)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="frequency">Frequency</Label>
        <select
          id="frequency"
          value={formData.frequency}
          onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Annual">Annual</option>
          <option value="One-time">One-time</option>
        </select>
      </div>
      
      <div>
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      
      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          required
        />
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default BudgetCalendar;
