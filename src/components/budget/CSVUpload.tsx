import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { startOfDay } from "date-fns";
import { calculateNextDueDate } from "@/utils/dateCalculations";
import type { BudgetTransaction } from "@/types/budget";

interface CSVUploadProps {
  onTransactionsLoaded: (transactions: BudgetTransaction[]) => void;
}

const CSVUpload = ({ onTransactionsLoaded }: CSVUploadProps) => {
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
          
          const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, ''));
          console.log('Parts:', parts);
          
          if (parts.length < 3) {
            console.warn(`Skipping line ${i}: insufficient data`);
            continue;
          }
          
          const title = parts[0];
          const frequency = parts[1];
          const amountStr = parts[2];
          
          // Skip title rows or empty frequency/amount
          if (!frequency || !amountStr || amountStr === '' || 
              frequency === '' || frequency === 'Frequency' ||
              title.toLowerCase().includes('household') ||
              title.toLowerCase().includes('expenditure') ||
              title.toLowerCase().includes('introduction')) {
            console.log(`Skipping title/header row: ${title}`);
            continue;
          }
          
          // Parse amount
          const amount = parseFloat(amountStr);
          if (isNaN(amount) || amount === 0) {
            console.warn(`Skipping line ${i}: invalid amount "${amountStr}"`);
            continue;
          }
          
          // Validate frequency
          if (!['Weekly', 'Monthly', 'Annual', 'One-time'].includes(frequency)) {
            console.warn(`Skipping line ${i}: invalid frequency "${frequency}"`);
            continue;
          }
          
          // Determine type based on keywords
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
                          title.toLowerCase().includes('lodgers') ||
                          title.toLowerCase().includes('welfare');
          
          const type = isIncome ? 'income' : 'expense';
          const finalAmount = Math.abs(amount);
          
          console.log('Adding transaction:', { 
            title, 
            frequency, 
            amount: finalAmount, 
            type 
          });
          
          const nextDueDate = calculateNextDueDate(type, frequency, today);
          
          newTransactions.push({
            id: `${Date.now()}-${i}`,
            title,
            frequency: frequency as 'Weekly' | 'Monthly' | 'Annual' | 'One-time',
            amount: finalAmount,
            type,
            startDate: today,
            nextDueDate
          });
        }
        
        console.log('Total transactions processed:', newTransactions.length);
        
        if (newTransactions.length === 0) {
          toast.error('No valid transactions found in CSV file');
          return;
        }
        
        onTransactionsLoaded(newTransactions);
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

  return (
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
  );
};

export default CSVUpload;
