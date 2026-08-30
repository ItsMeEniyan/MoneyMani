"use server"

import { prisma } from "@/lib/prisma"
import { registerSchema, type RegisterInput } from "@/lib/validations"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (existing) {
    throw new Error("An account with this email already exists")
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      password: hashedPassword,
    },
  })

  redirect("/login")
}
