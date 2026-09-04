import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mcpAuth } from "@/lib/mcp-auth"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

export async function GET(request: NextRequest) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const trips = await prisma.trip.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { expenses: { select: { amount: true } } },
  })

  if (trips.length === 0) {
    return NextResponse.json({ message: "No trips found." })
  }

  const active = trips.filter((t) => t.status === "ACTIVE")
  const completed = trips.filter((t) => t.status === "COMPLETED")
  const lines: string[] = []

  if (active.length) {
    lines.push("Active trips:")
    active.forEach((t) => {
      const total = t.expenses.reduce((s, e) => s + Number(e.amount), 0)
      lines.push(
        `  • ${t.name} — ${fmt(total)} (${t.expenses.length} expenses) [ID: ${t.id}]`
      )
    })
  }
  if (completed.length) {
    lines.push("\nCompleted trips:")
    completed.forEach((t) => {
      const total = t.expenses.reduce((s, e) => s + Number(e.amount), 0)
      lines.push(
        `  • ${t.name} — ${fmt(total)} (${t.expenses.length} expenses) [ID: ${t.id}]`
      )
    })
  }

  return NextResponse.json({ message: lines.join("\n") })
}

export async function POST(request: NextRequest) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const body = await request.json()
  const { name } = body
  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const trip = await prisma.trip.create({ data: { userId, name: name.trim() } })
  return NextResponse.json({ message: `Created trip "${trip.name}".`, tripId: trip.id })
}
