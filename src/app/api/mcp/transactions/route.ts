import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mcpAuth } from "@/lib/mcp-auth"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

export async function GET(request: NextRequest) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const sp = request.nextUrl.searchParams
  const type = sp.get("type")
  const category = sp.get("category")
  const month = sp.get("month")
  const limit = Math.min(parseInt(sp.get("limit") ?? "50", 10), 200)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId }
  if (type && type !== "ALL") where.type = type
  if (category && category !== "ALL") where.category = category
  if (month) {
    const [y, m] = month.split("-").map(Number)
    where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59, 999) }
  }

  const txs = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit,
  })

  if (txs.length === 0) {
    return NextResponse.json({ message: "No transactions found." })
  }

  const lines = txs.map(
    (t) =>
      `• [${t.type}] ${t.category} ${fmt(Number(t.amount))}${t.note ? ` — ${t.note}` : ""} (${t.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })})`
  )

  return NextResponse.json({ message: `Transactions (${txs.length}):\n${lines.join("\n")}` })
}

export async function POST(request: NextRequest) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const body = await request.json()
  const { type, category, amount, month, note } = body

  if (!type || !category || !amount || !month) {
    return NextResponse.json(
      { error: "type, category, amount, month are required" },
      { status: 400 }
    )
  }
  if (!["INCOME", "EXPENSE", "SAVINGS"].includes(type)) {
    return NextResponse.json(
      { error: "type must be INCOME, EXPENSE, or SAVINGS" },
      { status: 400 }
    )
  }
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 })
  }

  const [y, m] = month.split("-").map(Number)
  const date = new Date(y, m - 1, 1)

  await prisma.transaction.create({
    data: { userId, type, category, amount, date, note },
  })

  return NextResponse.json({
    message: `Added ${fmt(amount)} ${category} ${type.toLowerCase()} for ${date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}.`,
  })
}
