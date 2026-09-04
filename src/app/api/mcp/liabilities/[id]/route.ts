import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mcpAuth } from "@/lib/mcp-auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await mcpAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth
  const { id } = await params

  const liability = await prisma.liability.findUnique({ where: { id } })
  if (!liability || liability.userId !== userId) {
    return NextResponse.json({ error: "Liability not found" }, { status: 404 })
  }

  await prisma.liability.delete({ where: { id } })
  return NextResponse.json({ message: `Deleted liability "${liability.name}".` })
}
