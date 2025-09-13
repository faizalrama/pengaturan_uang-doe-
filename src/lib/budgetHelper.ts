import { Transaction } from '@/types/transaction';
import { selectQuery } from './database';

export interface BudgetRecommendation {
  needs: number; // 50%
  wants: number; // 30%
  savings: number; // 20%
}

/**
 * Calculates the 50/30/20 budget recommendation based on total monthly income.
 * @param monthlyIncome - The total income for the current month.
 * @returns An object with the suggested budget for needs, wants, and savings.
 */
export const get503020Budget = (monthlyIncome: number): BudgetRecommendation => {
  return {
    needs: monthlyIncome * 0.5,
    wants: monthlyIncome * 0.3,
    savings: monthlyIncome * 0.2,
  };
};

/**
 * Calculates the moving average of expenses over a specified period.
 * @param transactions - An array of transactions, sorted by date.
 * @param period - The number of days for the moving average window (e.g., 7 for a weekly average).
 * @returns An array of objects containing the date and the moving average for that date.
 */
export const calculateMovingAverage = (transactions: Transaction[], period: number): { date: string; average: number }[] => {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length < period) return [];

  const movingAverages: { date: string; average: number }[] = [];

  for (let i = 0; i <= expenses.length - period; i++) {
    const window = expenses.slice(i, i + period);
    const sum = window.reduce((acc, curr) => acc + curr.amount, 0);
    const average = sum / period;
    movingAverages.push({
      date: window[window.length - 1].date,
      average: average,
    });
  }

  return movingAverages;
};

/**
 * Checks if the current month's expenses are nearing the budget limit.
 * If so, triggers a notification.
 */
export const checkBudgetThreshold = async (thresholdPercent: number = 85) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const monthlyIncome = selectQuery<{ total: number }>(
    `SELECT SUM(amount) as total FROM transactions WHERE type = 'income' AND date BETWEEN ? AND ?`,
    [firstDayOfMonth, lastDayOfMonth]
  )[0]?.total || 0;

  const monthlyExpense = selectQuery<{ total: number }>(
    `SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ?`,
    [firstDayOfMonth, lastDayOfMonth]
  )[0]?.total || 0;

  if (monthlyIncome === 0) return; // No budget if no income

  const budget = get503020Budget(monthlyIncome);
  const expenseLimit = budget.needs + budget.wants; // 80% of income
  const thresholdAmount = expenseLimit * (thresholdPercent / 100);

  if (monthlyExpense >= thresholdAmount) {
    console.log(`Budget Alert: Expenses (${monthlyExpense}) have reached ${thresholdPercent}% of the limit (${expenseLimit}).`);

    // Check if a notification for this month has already been sent
    const alertKey = `budget_alert_${today.getFullYear()}_${today.getMonth()}`;
    if (localStorage.getItem(alertKey)) {
      console.log('Budget alert for this month already sent.');
      return;
    }

    if (navigator.serviceWorker.controller) {
      const percentage = Math.round((monthlyExpense / expenseLimit) * 100);
      navigator.serviceWorker.controller.postMessage({
        type: 'SEND_BUDGET_ALERT',
        message: `Pengeluaran Anda telah mencapai ${percentage}% dari budget bulan ini!`
      });
      // Mark that the notification has been sent for this month
      localStorage.setItem(alertKey, 'sent');
    }
  }
};
