
import { startOfMonth, addMonths, addDays, addWeeks, getDay, nextFriday } from "date-fns";

export const calculateNextDueDate = (type: 'income' | 'expense', frequency: string, today: Date): Date => {
  if (frequency === 'Monthly') {
    if (type === 'income') {
      // Income monthly: 1st of following month
      return startOfMonth(addMonths(today, 1));
    } else {
      // Expense monthly: 1st of month, but if Sat/Sun then next Monday
      const firstOfMonth = startOfMonth(addMonths(today, 1));
      const dayOfWeek = getDay(firstOfMonth); // 0=Sunday, 6=Saturday
      
      if (dayOfWeek === 0) { // Sunday
        return addDays(firstOfMonth, 1); // Next Monday
      } else if (dayOfWeek === 6) { // Saturday
        return addDays(firstOfMonth, 2); // Next Monday
      } else {
        return firstOfMonth; // Weekday, use as is
      }
    }
  } else if (frequency === 'Weekly' && type === 'income') {
    // Income weekly: next Friday from today
    return nextFriday(today);
  } else if (frequency === 'Fortnightly') {
    if (type === 'income') {
      // Fortnightly income: next Friday, then every 2 weeks
      return nextFriday(today);
    } else {
      // Fortnightly expense: 2 weeks from today, avoid weekends
      const twoWeeksFromNow = addWeeks(today, 2);
      const dayOfWeek = getDay(twoWeeksFromNow);
      
      if (dayOfWeek === 0) { // Sunday
        return addDays(twoWeeksFromNow, 1); // Next Monday
      } else if (dayOfWeek === 6) { // Saturday
        return addDays(twoWeeksFromNow, 2); // Next Monday
      } else {
        return twoWeeksFromNow; // Weekday, use as is
      }
    }
  } else {
    // For other cases (Annual, One-time, or expense weekly), use startDate
    return today;
  }
};
