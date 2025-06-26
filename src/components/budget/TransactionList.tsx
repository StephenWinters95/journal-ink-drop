
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { BudgetTransaction } from "@/types/budget";

interface TransactionListProps {
  transactions: BudgetTransaction[];
  onEditTransaction: (transaction: BudgetTransaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

const TransactionList = ({ transactions, onEditTransaction, onDeleteTransaction }: TransactionListProps) => {
  if (transactions.length === 0) {
    return null;
  }

  return (
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
                  onClick={() => onEditTransaction(transaction)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteTransaction(transaction.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
