"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createTransaction } from "@/actions/transactions"
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, SAVINGS_CATEGORIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TransactionType } from "@/types"

const TYPE_CONFIG = {
  INCOME: {
    label: "Income",
    emoji: "💰",
    description: "Salary, dividends, freelance",
    color: "border-green-500 bg-green-50 text-green-700",
    selectedColor: "border-green-500 bg-green-500 text-white",
    categories: INCOME_CATEGORIES,
  },
  EXPENSE: {
    label: "Expense",
    emoji: "💸",
    description: "Food, travel, bills",
    color: "border-red-400 bg-red-50 text-red-700",
    selectedColor: "border-red-400 bg-red-500 text-white",
    categories: EXPENSE_CATEGORIES,
  },
  SAVINGS: {
    label: "Savings",
    emoji: "📊",
    description: "Stocks, MFs, gold",
    color: "border-blue-400 bg-blue-50 text-blue-700",
    selectedColor: "border-blue-400 bg-blue-500 text-white",
    categories: SAVINGS_CATEGORIES,
  },
}

export default function AddTransactionFlow() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [type, setType] = useState<TransactionType | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)

  const config = type ? TYPE_CONFIG[type] : null

  async function handleSubmit() {
    if (!type || !category || !amount) return
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    setLoading(true)
    try {
      await createTransaction({
        type,
        category,
        amount: amountNum,
        date: new Date(date).toISOString(),
        note: note || undefined,
      })
      toast.success("Transaction added!")
      router.push("/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add transaction")
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[hsl(var(--muted-foreground))] text-center">What kind of transaction?</p>
        <div className="space-y-3">
          {(["INCOME", "EXPENSE", "SAVINGS"] as TransactionType[]).map((t) => {
            const cfg = TYPE_CONFIG[t]
            return (
              <button
                key={t}
                onClick={() => { setType(t); setStep(2) }}
                className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all active:scale-95 ${cfg.color}`}
              >
                <span className="text-3xl">{cfg.emoji}</span>
                <div className="text-left">
                  <p className="font-semibold text-base">{cfg.label}</p>
                  <p className="text-xs opacity-75">{cfg.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (step === 2 && config && type) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setStep(1)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            ← Back
          </button>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Select category</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {config.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setStep(3) }}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all active:scale-95 ${
                category === cat ? config.selectedColor : "border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setStep(2)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            ← Back
          </button>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{type} · {category}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Amount (₹)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[hsl(var(--muted-foreground))]">₹</span>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-16 text-3xl font-bold pl-10 pr-4 text-center"
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Note (optional)</Label>
          <Input
            type="text"
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className="w-full h-12 text-base"
        >
          {loading ? "Saving..." : "Save Transaction"}
        </Button>
      </div>
    )
  }

  return null
}
