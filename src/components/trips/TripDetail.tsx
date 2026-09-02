"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, CheckCircle2, FlagOff } from "lucide-react"
import { addTripExpense, deleteTripExpense, endTrip } from "@/actions/trips"
import { formatINR } from "@/lib/utils"
import { TRIP_CATEGORIES, TRIP_CATEGORY_ICONS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Expense {
  id: string
  category: string
  amount: number
  note: string | null
  createdAt: string
}

interface CategoryTotal {
  category: string
  amount: number
}

interface Props {
  id: string
  name: string
  status: "ACTIVE" | "COMPLETED"
  total: number
  expenses: Expense[]
  byCategory: CategoryTotal[]
}

export default function TripDetail({ id, name, status, total, expenses, byCategory }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")

  function resetDialog() {
    setStep(1)
    setCategory("")
    setAmount("")
    setNote("")
  }

  function handleAddExpense() {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    startTransition(async () => {
      try {
        await addTripExpense(id, { category, amount: amt, note: note || undefined })
        toast.success("Expense added!")
        setOpen(false)
        resetDialog()
      } catch {
        toast.error("Failed to add expense")
      }
    })
  }

  function handleDelete(expenseId: string) {
    if (!confirm("Delete this expense?")) return
    startTransition(async () => {
      try {
        await deleteTripExpense(expenseId, id)
        toast.success("Deleted")
      } catch {
        toast.error("Failed to delete")
      }
    })
  }

  function handleEndTrip() {
    if (!confirm("Mark this trip as completed?")) return
    startTransition(async () => {
      try {
        await endTrip(id)
        toast.success("Trip completed!")
        router.refresh()
      } catch {
        toast.error("Failed to end trip")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Total */}
      <div className="rounded-2xl border bg-[hsl(var(--card))] p-5 text-center space-y-1">
        <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{name}</p>
        <p className="text-3xl font-bold">{formatINR(total)}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
          {status === "COMPLETED" && (
            <span className="ml-2 inline-flex items-center gap-1 text-green-600 font-medium">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </span>
          )}
        </p>
      </div>

      {/* Actions */}
      {status === "ACTIVE" && (
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetDialog() }}>
            <DialogTrigger asChild>
              <Button className="flex-1 gap-2">
                <Plus className="h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{step === 1 ? "Pick category" : `${category} — Amount`}</DialogTitle>
              </DialogHeader>

              {step === 1 && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {TRIP_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setStep(2) }}
                      className="flex items-center gap-2 p-3 rounded-lg border text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors active:scale-95"
                    >
                      <span>{TRIP_CATEGORY_ICONS[cat]}</span>
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    ← Change category
                  </button>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Amount (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[hsl(var(--muted-foreground))]">₹</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-14 text-2xl font-bold pl-10 text-center"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Note (optional)</Label>
                    <Input
                      placeholder="e.g. Dinner at beach shack"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleAddExpense}
                    disabled={isPending || !amount}
                    className="w-full"
                  >
                    {isPending ? "Saving..." : "Add"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleEndTrip} disabled={isPending} className="gap-1">
            <FlagOff className="h-4 w-4" /> End Trip
          </Button>
        </div>
      )}

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">By Category</p>
          <div className="rounded-xl border divide-y bg-[hsl(var(--card))]">
            {byCategory.map(({ category: cat, amount: amt }) => {
              const pct = total > 0 ? (amt / total) * 100 : 0
              return (
                <div key={cat} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-lg">{TRIP_CATEGORY_ICONS[cat] ?? "📦"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{cat}</span>
                      <span className="text-sm font-semibold">{formatINR(amt)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${pct.toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] w-10 text-right">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          Expenses
        </p>
        {expenses.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">
            No expenses yet. Add your first one!
          </p>
        ) : (
          <div className="rounded-xl border divide-y bg-[hsl(var(--card))]">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-lg">{TRIP_CATEGORY_ICONS[e.category] ?? "📦"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{e.category}</p>
                  {e.note && <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{e.note}</p>}
                </div>
                <span className="text-sm font-semibold">{formatINR(e.amount)}</span>
                {status === "ACTIVE" && (
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
