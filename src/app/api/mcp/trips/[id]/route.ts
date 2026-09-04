import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mcpAuth } from "@/lib/mcp-auth"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth
  const { id } = await params

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { expenses: { orderBy: { createdAt: "desc" } } },
  })

  if (!trip || trip.userId !== userId) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  }

  const total = trip.expenses.reduce((s, e) => s + Number(e.amount), 0)

  const catMap = new Map<string, number>()
  for (const e of trip.expenses) {
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount))
  }
  const catLines = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(
      ([cat, amt]) =>
        `  • ${cat}: ${fmt(amt)}${total > 0 ? ` (${((amt / total) * 100).toFixed(0)}%)` : ""}`
    )
    .join("\n")

  const expLines = trip.expenses
    .slice(0, 20)
    .map(
      (e) => `  • ${e.category}: ${fmt(Number(e.amount))}${e.note ? ` — ${e.note}` : ""}`
    )
    .join("\n")

  const message = [
    `Trip: ${trip.name} [${trip.status}]`,
    `Total: ${fmt(total)} (${trip.expenses.length} expenses)`,
    catLines ? `\nBy category:\n${catLines}` : "",
    expLines ? `\nExpenses:\n${expLines}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  return NextResponse.json({ message })
}
