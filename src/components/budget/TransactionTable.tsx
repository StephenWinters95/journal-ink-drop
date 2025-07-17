import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useBudget } from '@/contexts/BudgetContext';
import type { BudgetTransaction } from '@/types/budget';

const TransactionTable = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useBudget();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<BudgetTransaction | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    frequency: 'Monthly',
    amount: '',
    type: 'expense',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        nextDueDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [sortField, setSortField] = useState<keyof BudgetTransaction>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  
  const handleAddTransaction = () => {
    try {
      const amount = parseFloat(newTransaction.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      const transaction: BudgetTransaction = {
        id: `${Date.now()}`,
        title: newTransaction.title,
        frequency: newTransaction.frequency as any,
        amount: amount,
        type: newTransaction.type as 'income' | 'expense',
        startDate: parseISO(newTransaction.startDate),
        nextDueDate: parseISO(newTransaction.nextDueDate)
      };
      
      addTransaction(transaction);
      
      // Reset form
      setNewTransaction({
        title: '',
        frequency: 'Monthly',
        amount: '',
        type: 'expense',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        nextDueDate: format(new Date(), 'yyyy-MM-dd')
      });
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert(error instanceof Error ? error.message : 'Failed to add transaction');
    }
  };
  
  const handleEditTransaction = (transaction: BudgetTransaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateTransaction = () => {
    if (!editingTransaction) return;
    updateTransaction(editingTransaction);
    setIsEditDialogOpen(false);
    setEditingTransaction(null);
  };
  
  
  const handleSort = (field: keyof BudgetTransaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'amount' || sortField === 'startDate') {
      comparison = (a[sortField] as any) > (b[sortField] as any) ? 1 : -1;
    } else {
      comparison = String(a[sortField] || '').localeCompare(String(b[sortField] || ''));
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Budget Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                  Description {sortField === 'title' && (
                    sortDirection === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                  Type {sortField === 'type' && (
                    sortDirection === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('frequency')}>
                  Frequency {sortField === 'frequency' && (
                    sortDirection === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('nextDueDate')}>
                  Next Due {sortField === 'nextDueDate' && (
                    sortDirection === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                  Amount {sortField === 'amount' && (
                    sortDirection === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />
                  )}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    No transactions found. Add a transaction or upload a CSV file.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/30">
                    <TableCell 
                      className="cursor-pointer hover:bg-muted/50 border border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors" 
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      {transaction.title}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-muted/50 border border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors" 
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-muted/50 border border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors" 
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      {transaction.frequency}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-muted/50 border border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors" 
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      {transaction.nextDueDate ? format(new Date(transaction.nextDueDate), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell 
                      className={`cursor-pointer hover:bg-muted/50 border border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors ${transaction.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      €{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTransaction(transaction.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Add Transaction Banner */}
        <div className="mt-6">
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="w-full h-12 text-lg"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </div>
      </CardContent>
      
      {/* Add Transaction Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Description</Label>
              <Input 
                id="title" 
                value={newTransaction.title} 
                onChange={(e) => setNewTransaction(prev => ({ ...prev, title: e.target.value }))} 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={newTransaction.type}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground z-10"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="frequency">Frequency</Label>
                <select
                  id="frequency"
                  value={newTransaction.frequency}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground z-10"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                  <option value="One-time">One-time</option>
                </select>
            </div>
            
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                value={newTransaction.amount} 
                onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))} 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={newTransaction.startDate} 
                onChange={(e) => setNewTransaction(prev => ({ ...prev, startDate: e.target.value }))} 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="nextDueDate">Next Due Date</Label>
              <Input 
                id="nextDueDate" 
                type="date" 
                value={newTransaction.nextDueDate} 
                onChange={(e) => setNewTransaction(prev => ({ ...prev, nextDueDate: e.target.value }))} 
                required 
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction}>
                Add Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-title">Description</Label>
                <Input 
                  id="edit-title" 
                  value={editingTransaction.title} 
                  onChange={(e) => setEditingTransaction(prev => ({ ...prev!, title: e.target.value }))} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <select
                  id="edit-type"
                  value={editingTransaction.type}
                  onChange={(e) => setEditingTransaction(prev => ({ ...prev!, type: e.target.value as 'income' | 'expense' }))}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground z-10"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-frequency">Frequency</Label>
                <select
                  id="edit-frequency"
                  value={editingTransaction.frequency}
                  onChange={(e) => setEditingTransaction(prev => ({ ...prev!, frequency: e.target.value as any }))}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground z-10"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                  <option value="One-time">One-time</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-amount">Amount</Label>
                <Input 
                  id="edit-amount" 
                  type="number" 
                  step="0.01" 
                  value={editingTransaction.amount} 
                  onChange={(e) => setEditingTransaction(prev => ({ ...prev!, amount: parseFloat(e.target.value) || prev!.amount }))} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input 
                  id="edit-startDate" 
                  type="date" 
                  value={format(new Date(editingTransaction.startDate), 'yyyy-MM-dd')} 
                  onChange={(e) => setEditingTransaction(prev => ({ ...prev!, startDate: parseISO(e.target.value) }))} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="edit-nextDueDate">Next Due Date</Label>
                <Input 
                  id="edit-nextDueDate" 
                  type="date" 
                  value={editingTransaction.nextDueDate ? format(new Date(editingTransaction.nextDueDate), 'yyyy-MM-dd') : ''} 
                  onChange={(e) => setEditingTransaction(prev => ({ ...prev!, nextDueDate: e.target.value ? parseISO(e.target.value) : undefined }))} 
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTransaction}>
                  Update Transaction
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TransactionTable;