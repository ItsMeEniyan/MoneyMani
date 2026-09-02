import { z } from "zod"
import { TransactionType } from "@prisma/client"

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).or(z.string().regex(/^\d{4}-\d{2}$/)),
  note: z.string().optional(),
})

export const liabilitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type LiabilityInput = z.infer<typeof liabilitySchema>
