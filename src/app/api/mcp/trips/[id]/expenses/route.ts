import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mcpAuth } from "@/lib/mcp-auth"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth
  const { id: tripId } = await params

  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip || trip.userId !== userId) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  }
  if (trip.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Cannot add expense to a completed trip" },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { category, amount, note } = body

  if (!category || amount == null) {
    return NextResponse.json({ error: "category and amount are required" }, { status: 400 })
  }
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 })
  }

  await prisma.tripExpense.create({ data: { tripId, category, amount, note } })

  return NextResponse.json({
    message: `Added ${fmt(amount)} ${category} expense to trip "${trip.name}".`,
  })
}
