import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useBudget } from '@/contexts/BudgetContext';
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const DashboardCharts = () => {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const { budgetData: { budgetData } } = useBudget();
  
  // Organize data for charts
  const getChartData = () => {
    const now = new Date();
    let startDate, endDate;
    
    if (view === 'weekly') {
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
    } else {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }
    
    // Filter budget items for the selected period
    const periodItems = budgetData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
    
    // Aggregate data for bar chart
    const barData = [];
    
    // For weekly view, show each day
    if (view === 'weekly') {
      for (let day = 0; day < 7; day++) {
        const date = addDays(startDate, day);
        const dayItems = periodItems.filter(item => {
          return format(item.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });
        
        const income = dayItems
          .filter(item => item.type === 'income')
          .reduce((sum, item) => sum + item.amount, 0);
          
        const expense = dayItems
          .filter(item => item.type === 'expense')
          .reduce((sum, item) => sum + item.amount, 0);
          
        barData.push({
          name: format(date, 'EEE'),
          income,
          expense
        });
      }
    } else {
      // For monthly view, group by week
      const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      for (let week = 0; week < totalWeeks; week++) {
        const weekStart = addDays(startDate, week * 7);
        const weekEnd = addDays(weekStart, 6);
        
        const weekItems = periodItems.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= weekStart && itemDate <= weekEnd;
        });
        
        const income = weekItems
          .filter(item => item.type === 'income')
          .reduce((sum, item) => sum + item.amount, 0);
          
        const expense = weekItems
          .filter(item => item.type === 'expense')
          .reduce((sum, item) => sum + item.amount, 0);
          
        barData.push({
          name: `Week ${week + 1}`,
          income,
          expense
        });
      }
    }
    
    // Aggregate data for pie chart (expenses by category)
    const expenseItems = periodItems.filter(item => item.type === 'expense');
    const expenseByCategory: Record<string, number> = {};
    
    expenseItems.forEach(item => {
      const category = item.description.split(' ')[0] || 'Other';
      if (!expenseByCategory[category]) {
        expenseByCategory[category] = 0;
      }
      expenseByCategory[category] += item.amount;
    });
    
    const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
      name,
      value
    }));
    
    return { barData, pieData };
  };
  
  const { barData, pieData } = getChartData();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Financial Overview</CardTitle>
          <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as 'weekly' | 'monthly')}>
            <ToggleGroupItem value="weekly" aria-label="Weekly view">Weekly</ToggleGroupItem>
            <ToggleGroupItem value="monthly" aria-label="Monthly view">Monthly</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar Chart */}
          <div className="h-[300px]">
            <h3 className="text-sm font-medium mb-2">Income vs. Expenses</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" />
                <Bar dataKey="expense" name="Expenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="h-[300px]">
            <h3 className="text-sm font-medium mb-2">Expense Categories</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCharts;