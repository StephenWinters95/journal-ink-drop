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
        
        // Parse CSV properly handling quoted fields containing commas
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                // Handle escaped quotes
                current += '"';
                i++; // Skip next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          
          result.push(current.trim());
          return result;
        };

        const lines = csv.split('\n').filter(line => line.trim() !== '');
        console.log('Total lines:', lines.length);
        
        if (lines.length === 0) {
          toast.error('CSV file is empty');
          return;
        }

        const newTransactions: BudgetTransaction[] = [];
        const skippedLines: { line: number; reason: string; content: string }[] = [];
        const today = startOfDay(new Date());
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) {
            skippedLines.push({ line: i + 1, reason: 'Empty line', content: line });
            continue;
          }
          
          console.log(`Processing line ${i + 1}:`, line);
          
          const parts = parseCSVLine(line);
          console.log('Parsed parts:', parts);
          
          if (parts.length < 3) {
            skippedLines.push({ line: i + 1, reason: 'Insufficient data (less than 3 columns)', content: line });
            continue;
          }
          
          const title = parts[0].trim();
          const frequency = parts[1].trim();
          const amountStr = parts[2].trim();
          
          // Skip title rows or empty frequency/amount
          if (!frequency || frequency === 'Frequency' ||
              title.toLowerCase().includes('household') ||
              title.toLowerCase().includes('expenditure') ||
              title.toLowerCase().includes('introduction')) {
            skippedLines.push({ line: i + 1, reason: 'Header/title row detected', content: line });
            continue;
          }
          
          // Parse amount (skip zero amounts)
          const amount = parseFloat(amountStr.replace(/[£$€,]/g, ''));
          if (isNaN(amount)) {
            skippedLines.push({ line: i + 1, reason: `Invalid amount: "${amountStr}"`, content: line });
            continue;
          }
          
          if (amount === 0) {
            skippedLines.push({ line: i + 1, reason: `Zero amount skipped: "${amountStr}"`, content: line });
            continue;
          }
          
          // Improved frequency validation with common variations
          const normalizedFrequency = frequency.toLowerCase();
          let validFrequency: 'Weekly' | 'Fortnightly' | 'Monthly' | 'Annual' | 'One-time';
          
          if (normalizedFrequency.includes('week')) {
            validFrequency = 'Weekly';
          } else if (normalizedFrequency.includes('fortnight') || normalizedFrequency.includes('bi-week')) {
            validFrequency = 'Fortnightly';
          } else if (normalizedFrequency.includes('month')) {
            validFrequency = 'Monthly';
          } else if (normalizedFrequency.includes('annual') || normalizedFrequency.includes('year')) {
            validFrequency = 'Annual';
          } else if (normalizedFrequency.includes('one') || normalizedFrequency.includes('once')) {
            validFrequency = 'One-time';
          } else {
            skippedLines.push({ line: i + 1, reason: `Invalid frequency: "${frequency}"`, content: line });
            continue;
          }
          
          // Determine type based on keywords
          // First check for items that should be expenses (overrides income keywords)
          const isDefinitelyExpense = title.toLowerCase().includes('pocket money') ||
                                    title.toLowerCase().includes('childrens') ||
                                    title.toLowerCase().includes('children') ||
                                    title.toLowerCase().includes('mortgage payment protection') ||
                                    title.toLowerCase().includes('pension contribution') ||
                                    title.toLowerCase().includes('repair and maintenance') ||
                                    title.toLowerCase().includes('maintenance') ||
                                    title.toLowerCase().includes('gifts') ||
                                    title.toLowerCase().includes('voluntary contribution') ||
                                    title.toLowerCase().includes('membership') ||
                                    title.toLowerCase().includes('school fees') ||
                                    title.toLowerCase().includes('college fees') ||
                                    title.toLowerCase().includes('school uniform') ||
                                    title.toLowerCase().includes('school books') ||
                                    title.toLowerCase().includes('college books') ||
                                    title.toLowerCase().includes('nct') ||
                                    title.toLowerCase().includes('insurance');
          
          const isIncome = !isDefinitelyExpense && (
                          title.toLowerCase().includes('income') || 
                          title.toLowerCase().includes('earnings') || 
                          title.toLowerCase().includes('salary') ||
                          title.toLowerCase().includes('wage') ||
                          title.toLowerCase().includes('benefit') ||
                          title.toLowerCase().includes('payment') ||
                          title.toLowerCase().includes('pension') ||
                          title.toLowerCase().includes('allowance') ||
                          title.toLowerCase().includes('grant') ||
                          title.toLowerCase().includes('boarders') ||
                          title.toLowerCase().includes('lodgers') ||
                          title.toLowerCase().includes('welfare'));
          
          const type = isIncome ? 'income' : 'expense';
          const finalAmount = Math.abs(amount);
          
          console.log('Adding transaction:', { 
            title, 
            frequency, 
            amount: finalAmount, 
            type 
          });
          
          const nextDueDate = calculateNextDueDate(type, validFrequency, today);
          
          newTransactions.push({
            id: `${Date.now()}-${i}`,
            title,
            frequency: validFrequency,
            amount: finalAmount,
            type,
            startDate: today,
            nextDueDate
          });
        }
        
        console.log('Total transactions processed:', newTransactions.length);
        console.log('Skipped lines:', skippedLines);
        
        // Enhanced feedback with detailed skipping information
        if (skippedLines.length > 0) {
          console.log('\nDetailed skip reasons:');
          skippedLines.forEach(skip => {
            console.log(`Line ${skip.line}: ${skip.reason}`);
            console.log(`Content: "${skip.content}"`);
          });
          
          toast.info(`Processed ${newTransactions.length} transactions, skipped ${skippedLines.length} lines. Check console for details.`);
        }
        
        if (newTransactions.length === 0) {
          toast.error('No valid transactions found in CSV file. Check console for details on skipped lines.');
          return;
        }
        
        onTransactionsLoaded(newTransactions);
        toast.success(`Successfully loaded ${newTransactions.length} transactions${skippedLines.length > 0 ? ` (${skippedLines.length} lines skipped)` : ''}`);
        
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
