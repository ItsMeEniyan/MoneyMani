import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mcpAuth } from "@/lib/mcp-auth"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

export async function GET(request: NextRequest) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const liabilities = await prisma.liability.findMany({ where: { userId } })

  if (liabilities.length === 0) {
    return NextResponse.json({ message: "No liabilities found." })
  }

  const total = liabilities.reduce((s, l) => s + Number(l.amount), 0)
  const lines = liabilities.map((l) => `  • ${l.name}: ${fmt(Number(l.amount))}`)

  return NextResponse.json({
    message: `Liabilities (${liabilities.length}):\n${lines.join("\n")}\nTotal: ${fmt(total)}`,
  })
}

export async function POST(request: NextRequest) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const body = await request.json()
  const { name, amount } = body

  if (!name?.trim() || amount == null) {
    return NextResponse.json({ error: "name and amount are required" }, { status: 400 })
  }
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 })
  }

  const liability = await prisma.liability.create({
    data: { userId, name: name.trim(), amount },
  })

  return NextResponse.json({
    message: `Added liability "${liability.name}" for ${fmt(amount)}.`,
  })
}
