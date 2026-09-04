import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function mcpAuth(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const key = authHeader.slice(7)
  const keyHash = createHash("sha256").update(key).digest("hex")

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { userId: true },
  })

  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return { userId: apiKey.userId }
}
