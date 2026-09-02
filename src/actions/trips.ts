"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

const tripExpenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  note: z.string().optional(),
})

export async function createTrip(name: string) {
  const userId = await getUserId()
  if (!name.trim()) throw new Error("Trip name is required")
  const trip = await prisma.trip.create({
    data: { userId, name: name.trim() },
  })
  revalidatePath("/trips")
  return trip.id
}

export async function endTrip(id: string) {
  const userId = await getUserId()
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip || trip.userId !== userId) throw new Error("Not found")
  await prisma.trip.update({ where: { id }, data: { status: "COMPLETED" } })
  revalidatePath("/trips")
  revalidatePath(`/trips/${id}`)
}

export async function deleteTrip(id: string) {
  const userId = await getUserId()
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip || trip.userId !== userId) throw new Error("Not found")
  await prisma.trip.delete({ where: { id } })
  revalidatePath("/trips")
}

export async function addTripExpense(
  tripId: string,
  data: { category: string; amount: number; note?: string }
) {
  const userId = await getUserId()
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip || trip.userId !== userId) throw new Error("Not found")
  const parsed = tripExpenseSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  await prisma.tripExpense.create({
    data: {
      tripId,
      category: parsed.data.category,
      amount: parsed.data.amount,
      note: parsed.data.note,
    },
  })
  revalidatePath(`/trips/${tripId}`)
}

export async function deleteTripExpense(id: string, tripId: string) {
  const userId = await getUserId()
  const expense = await prisma.tripExpense.findUnique({
    where: { id },
    include: { trip: true },
  })
  if (!expense || expense.trip.userId !== userId) throw new Error("Not found")
  await prisma.tripExpense.delete({ where: { id } })
  revalidatePath(`/trips/${tripId}`)
}

export async function getTrips() {
  const userId = await getUserId()
  const trips = await prisma.trip.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { expenses: { select: { amount: true } } },
  })
  return trips.map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    total: t.expenses.reduce((s, e) => s + Number(e.amount), 0),
    expenseCount: t.expenses.length,
  }))
}

export async function getTripDetail(id: string) {
  const userId = await getUserId()
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { expenses: { orderBy: { createdAt: "desc" } } },
  })
  if (!trip || trip.userId !== userId) throw new Error("Not found")

  const catMap = new Map<string, number>()
  for (const e of trip.expenses) {
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount))
  }
  const byCategory = Array.from(catMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  return {
    id: trip.id,
    name: trip.name,
    status: trip.status,
    createdAt: trip.createdAt.toISOString(),
    total: trip.expenses.reduce((s, e) => s + Number(e.amount), 0),
    expenses: trip.expenses.map((e) => ({
      id: e.id,
      category: e.category,
      amount: Number(e.amount),
      note: e.note,
      createdAt: e.createdAt.toISOString(),
    })),
    byCategory,
  }
}
