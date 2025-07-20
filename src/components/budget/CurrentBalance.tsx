
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { useBudget } from '@/contexts/BudgetContext';
import InlineEditCell from './InlineEditCell';

const CurrentBalance = () => {
  const { bankAccount, savings, updateBankAccount, updateSavings } = useBudget();
  const [editingField, setEditingField] = useState<'bankAccount' | 'savings' | null>(null);

  const totalBalance = bankAccount + savings;

  const handleSave = (field: 'bankAccount' | 'savings', value: number) => {
    if (field === 'bankAccount') {
      updateBankAccount(value);
    } else {
      updateSavings(value);
    }
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Current Balance</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingField(editingField ? null : 'bankAccount')}
            className="h-8 w-8 p-0"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Bank Account</span>
            {editingField === 'bankAccount' ? (
              <InlineEditCell
                value={bankAccount}
                onSave={(value) => handleSave('bankAccount', value)}
                onCancel={handleCancel}
                type="number"
                className="w-24 text-right"
              />
            ) : (
              <span 
                className="font-medium cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                onClick={() => setEditingField('bankAccount')}
              >
                {formatCurrency(bankAccount)}
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Savings</span>
            {editingField === 'savings' ? (
              <InlineEditCell
                value={savings}
                onSave={(value) => handleSave('savings', value)}
                onCancel={handleCancel}
                type="number"
                className="w-24 text-right"
              />
            ) : (
              <span 
                className="font-medium cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                onClick={() => setEditingField('savings')}
              >
                {formatCurrency(savings)}
              </span>
            )}
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className={`font-bold text-lg ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalBalance)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentBalance;
