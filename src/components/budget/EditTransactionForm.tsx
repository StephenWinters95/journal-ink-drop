
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import type { BudgetTransaction } from "@/types/budget";

interface EditTransactionFormProps {
  transaction: BudgetTransaction;
  onSave: (transaction: BudgetTransaction) => void;
  onCancel: () => void;
}

const EditTransactionForm = ({ transaction, onSave, onCancel }: EditTransactionFormProps) => {
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
          onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as 'Weekly' | 'Monthly' | 'Annual' | 'One-time' }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
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

export default EditTransactionForm;
