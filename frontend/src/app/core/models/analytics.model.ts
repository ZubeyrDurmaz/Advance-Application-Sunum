export interface CategorySpending {
  categoryName: string;
  totalSpent: number;
  percentage: number;
}

export interface MonthlyActivity {
  month: string;
  year: number;
  orderCount: number;
  percentage: number;
}
