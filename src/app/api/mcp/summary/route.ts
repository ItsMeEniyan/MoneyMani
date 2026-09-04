import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mcpAuth } from "@/lib/mcp-auth"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

export async function GET(request: NextRequest) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const sp = request.nextUrl.searchParams
  const month = sp.get("month")

  let start: Date, end: Date, label: string
  if (month) {
    const [y, m] = month.split("-").map(Number)
    start = new Date(y, m - 1, 1)
    end = new Date(y, m, 0, 23, 59, 59, 999)
    label = start.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  } else {
    const now = new Date()
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    label = start.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  }

  const txs = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
  })

  const income = txs
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + Number(t.amount), 0)
  const expenses = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + Number(t.amount), 0)
  const savings = txs
    .filter((t) => t.type === "SAVINGS")
    .reduce((s, t) => s + Number(t.amount), 0)

  const expCatMap = new Map<string, number>()
  for (const t of txs.filter((t) => t.type === "EXPENSE")) {
    expCatMap.set(t.category, (expCatMap.get(t.category) ?? 0) + Number(t.amount))
  }
  const topCategories = Array.from(expCatMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `  • ${cat}: ${fmt(amt)}`)
    .join("\n")

  const message = [
    `Summary for ${label}:`,
    `Income: ${fmt(income)}`,
    `Expenses: ${fmt(expenses)}`,
    `Savings: ${fmt(savings)}`,
    `Net Cash Flow: ${fmt(income - expenses)}`,
    topCategories ? `\nTop expense categories:\n${topCategories}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  return NextResponse.json({ message })
}
