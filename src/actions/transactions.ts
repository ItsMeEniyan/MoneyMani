"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { transactionSchema, type TransactionInput } from "@/lib/validations"
import { getCurrentMonthRange } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import type { DashboardData, ReportsData, SerializedTransaction } from "@/types"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

export async function createTransaction(data: TransactionInput) {
  const userId = await getUserId()
  const parsed = transactionSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await prisma.transaction.create({
    data: {
      userId,
      type: parsed.data.type,
      category: parsed.data.category,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
      note: parsed.data.note,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/transactions")
  revalidatePath("/reports")
}

export async function deleteTransaction(id: string) {
  const userId = await getUserId()
  const tx = await prisma.transaction.findUnique({ where: { id } })
  if (!tx || tx.userId !== userId) throw new Error("Not found")
  await prisma.transaction.delete({ where: { id } })
  revalidatePath("/dashboard")
  revalidatePath("/transactions")
  revalidatePath("/reports")
}

export async function getTransactions(filters?: {
  type?: string
  category?: string
  month?: string
}): Promise<SerializedTransaction[]> {
  const userId = await getUserId()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId }

  if (filters?.type && filters.type !== "ALL") {
    where.type = filters.type as "INCOME" | "EXPENSE" | "SAVINGS"
  }
  if (filters?.category && filters.category !== "ALL") {
    where.category = filters.category
  }
  if (filters?.month) {
    const [year, month] = filters.month.split("-").map(Number)
    where.date = {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 0, 23, 59, 59, 999),
    }
  }

  const txs = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: 200,
  })

  return txs.map((t) => ({
    id: t.id,
    userId: t.userId,
    type: t.type,
    category: t.category,
    amount: Number(t.amount),
    date: t.date.toISOString(),
    note: t.note,
    createdAt: t.createdAt.toISOString(),
  }))
}

export async function getDashboardData(): Promise<DashboardData> {
  const userId = await getUserId()
  const { start, end } = getCurrentMonthRange()

  const [monthlyTxs, allSavings, liabilities, recentTxs] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "SAVINGS" },
      _sum: { amount: true },
    }),
    prisma.liability.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ])

  const income = monthlyTxs
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + Number(t.amount), 0)
  const expenses = monthlyTxs
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + Number(t.amount), 0)
  const savings = monthlyTxs
    .filter((t) => t.type === "SAVINGS")
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalAssets = Number(allSavings._sum.amount ?? 0)
  const totalLiabilities = Number(liabilities._sum.amount ?? 0)

  return {
    currentMonth: {
      income,
      expenses,
      savings,
      netCashFlow: income - expenses,
    },
    netWorth: {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    },
    recentTransactions: recentTxs.map((t) => ({
      id: t.id,
      userId: t.userId,
      type: t.type,
      category: t.category,
      amount: Number(t.amount),
      date: t.date.toISOString(),
      note: t.note,
      createdAt: t.createdAt.toISOString(),
    })),
  }
}

export async function getReportsData(months = 6): Promise<ReportsData> {
  const userId = await getUserId()
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

  const [txs, liabilities] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: startDate } },
      orderBy: { date: "asc" },
    }),
    prisma.liability.findMany({ where: { userId } }),
  ])

  // Monthly totals
  const monthMap = new Map<string, { income: number; expenses: number; savings: number }>()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthMap.set(key, { income: 0, expenses: 0, savings: 0 })
  }
  for (const t of txs) {
    const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`
    const entry = monthMap.get(key)
    if (!entry) continue
    const amt = Number(t.amount)
    if (t.type === "INCOME") entry.income += amt
    else if (t.type === "EXPENSE") entry.expenses += amt
    else if (t.type === "SAVINGS") entry.savings += amt
  }
  const monthlyTotals = Array.from(monthMap.entries()).map(([month, v]) => ({ month, ...v }))

  // Expense by category (current month)
  const { start, end } = getCurrentMonthRange()
  const currentExpenses = txs.filter(
    (t) => t.type === "EXPENSE" && t.date >= start && t.date <= end
  )
  const expCatMap = new Map<string, number>()
  for (const t of currentExpenses) {
    expCatMap.set(t.category, (expCatMap.get(t.category) ?? 0) + Number(t.amount))
  }
  const expenseByCategory = Array.from(expCatMap.entries()).map(([category, amount]) => ({
    category,
    amount,
  }))

  // Income by category (current month)
  const currentIncome = txs.filter(
    (t) => t.type === "INCOME" && t.date >= start && t.date <= end
  )
  const incCatMap = new Map<string, number>()
  for (const t of currentIncome) {
    incCatMap.set(t.category, (incCatMap.get(t.category) ?? 0) + Number(t.amount))
  }
  const incomeByCategory = Array.from(incCatMap.entries()).map(([category, amount]) => ({
    category,
    amount,
  }))

  // Savings by category (all time)
  const allSavingsTxs = await prisma.transaction.findMany({
    where: { userId, type: "SAVINGS" },
  })
  const savCatMap = new Map<string, number>()
  for (const t of allSavingsTxs) {
    savCatMap.set(t.category, (savCatMap.get(t.category) ?? 0) + Number(t.amount))
  }
  const savingsByCategory = Array.from(savCatMap.entries()).map(([category, amount]) => ({
    category,
    amount,
  }))

  const totalAssets = savingsByCategory.reduce((s, c) => s + c.amount, 0)

  return {
    monthlyTotals,
    expenseByCategory,
    incomeByCategory,
    liabilities: liabilities.map((l) => ({
      id: l.id,
      userId: l.userId,
      name: l.name,
      amount: Number(l.amount),
      updatedAt: l.updatedAt.toISOString(),
    })),
    totalAssets,
    savingsByCategory,
  }
}
