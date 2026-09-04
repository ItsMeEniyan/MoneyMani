"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes, createHash } from "crypto"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

export async function generateApiKey(): Promise<string> {
  const userId = await getUserId()

  // Revoke all existing keys for this user before creating a new one
  await prisma.apiKey.deleteMany({ where: { userId } })

  const plaintext = "mm_" + randomBytes(32).toString("hex")
  const keyHash = createHash("sha256").update(plaintext).digest("hex")

  await prisma.apiKey.create({ data: { userId, keyHash, label: "MCP Key" } })

  revalidatePath("/settings")
  return plaintext
}

export async function deleteApiKey(id: string): Promise<void> {
  const userId = await getUserId()
  const key = await prisma.apiKey.findUnique({ where: { id } })
  if (!key || key.userId !== userId) throw new Error("Not found")
  await prisma.apiKey.delete({ where: { id } })
  revalidatePath("/settings")
}

export async function getApiKeys(): Promise<{ id: string; label: string; createdAt: Date }[]> {
  const userId = await getUserId()
  return prisma.apiKey.findMany({
    where: { userId },
    select: { id: true, label: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
}
