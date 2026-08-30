import type { Transaction, Liability, TransactionType } from "@prisma/client"

export type { Transaction, Liability, TransactionType }

export interface DashboardData {
  currentMonth: {
    income: number
    expenses: number
    savings: number
    netCashFlow: number
  }
  netWorth: {
    totalAssets: number
    totalLiabilities: number
    netWorth: number
  }
  recentTransactions: SerializedTransaction[]
}

export interface SerializedTransaction {
  id: string
  userId: string
  type: TransactionType
  category: string
  amount: number
  date: string
  note: string | null
  createdAt: string
}

export interface SerializedLiability {
  id: string
  userId: string
  name: string
  amount: number
  updatedAt: string
}

export interface MonthlyTotal {
  month: string
  income: number
  expenses: number
  savings: number
}

export interface CategoryTotal {
  category: string
  amount: number
}

export interface ReportsData {
  monthlyTotals: MonthlyTotal[]
  expenseByCategory: CategoryTotal[]
  incomeByCategory: CategoryTotal[]
  liabilities: SerializedLiability[]
  totalAssets: number
  savingsByCategory: CategoryTotal[]
}
