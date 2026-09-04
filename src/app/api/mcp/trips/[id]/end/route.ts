import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mcpAuth } from "@/lib/mcp-auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth
  const { id } = await params

  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip || trip.userId !== userId) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  }
  if (trip.status === "COMPLETED") {
    return NextResponse.json({ error: "Trip is already completed" }, { status: 400 })
  }

  await prisma.trip.update({ where: { id }, data: { status: "COMPLETED" } })
  return NextResponse.json({ message: `Trip "${trip.name}" ended.` })
}
