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

  const tx = await prisma.transaction.findUnique({ where: { id } })
  if (!tx || tx.userId !== userId) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  }

  await prisma.transaction.delete({ where: { id } })
  return NextResponse.json({ message: "Transaction deleted." })
}
