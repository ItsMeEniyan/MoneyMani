import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function mcpAuth(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get("Authorization")
  const apiKey = process.env.MCP_API_KEY

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const email = process.env.MCP_USER_EMAIL
  if (!email) {
    return NextResponse.json({ error: "MCP_USER_EMAIL not configured" }, { status: 500 })
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return { userId: user.id }
}
