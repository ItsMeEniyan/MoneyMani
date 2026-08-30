"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { liabilitySchema, type LiabilityInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import type { SerializedLiability } from "@/types"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

export async function getLiabilities(): Promise<SerializedLiability[]> {
  const userId = await getUserId()
  const liabilities = await prisma.liability.findMany({ where: { userId } })
  return liabilities.map((l) => ({
    id: l.id,
    userId: l.userId,
    name: l.name,
    amount: Number(l.amount),
    updatedAt: l.updatedAt.toISOString(),
  }))
}

export async function createLiability(data: LiabilityInput) {
  const userId = await getUserId()
  const parsed = liabilitySchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  await prisma.liability.create({
    data: { userId, name: parsed.data.name, amount: parsed.data.amount },
  })
  revalidatePath("/settings")
  revalidatePath("/reports")
}

export async function updateLiability(id: string, data: LiabilityInput) {
  const userId = await getUserId()
  const existing = await prisma.liability.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) throw new Error("Not found")
  const parsed = liabilitySchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  await prisma.liability.update({
    where: { id },
    data: { name: parsed.data.name, amount: parsed.data.amount },
  })
  revalidatePath("/settings")
  revalidatePath("/reports")
}

export async function deleteLiability(id: string) {
  const userId = await getUserId()
  const existing = await prisma.liability.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) throw new Error("Not found")
  await prisma.liability.delete({ where: { id } })
  revalidatePath("/settings")
  revalidatePath("/reports")
}
