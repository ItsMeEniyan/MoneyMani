import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mcpAuth } from "@/lib/mcp-auth"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

export async function GET(request: NextRequest) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const [savingsAgg, liabilities] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "SAVINGS" },
      _sum: { amount: true },
    }),
    prisma.liability.findMany({ where: { userId } }),
  ])

  const totalAssets = Number(savingsAgg._sum.amount ?? 0)
  const totalLiabilities = liabilities.reduce((s, l) => s + Number(l.amount), 0)
  const netWorth = totalAssets - totalLiabilities

  const liabilityLines = liabilities.length
    ? liabilities.map((l) => `  • ${l.name}: ${fmt(Number(l.amount))}`).join("\n")
    : "  (none)"

  const message = [
    "Net Worth Summary:",
    `Total Savings/Assets: ${fmt(totalAssets)}`,
    `Total Liabilities: ${fmt(totalLiabilities)}`,
    `Net Worth: ${fmt(netWorth)}`,
    `\nLiabilities:\n${liabilityLines}`,
  ].join("\n")

  return NextResponse.json({ message })
}
