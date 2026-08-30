"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, SAVINGS_CATEGORIES } from "@/lib/constants"

const ALL_CATEGORIES = ["ALL", ...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...SAVINGS_CATEGORIES]

function getLastMonths(n: number) {
  const months = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    months.push({ value, label })
  }
  return months
}

export default function TransactionFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const months = getLastMonths(12)

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value === "ALL" || value === "") p.delete(key)
    else p.set(key, value)
    router.push(`/transactions?${p.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Select value={params.get("type") ?? "ALL"} onValueChange={(v) => update("type", v)}>
        <SelectTrigger className="min-w-[110px] h-9 text-xs">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All types</SelectItem>
          <SelectItem value="INCOME">Income</SelectItem>
          <SelectItem value="EXPENSE">Expense</SelectItem>
          <SelectItem value="SAVINGS">Savings</SelectItem>
        </SelectContent>
      </Select>

      <Select value={params.get("category") ?? "ALL"} onValueChange={(v) => update("category", v)}>
        <SelectTrigger className="min-w-[130px] h-9 text-xs">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          {ALL_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>{c === "ALL" ? "All categories" : c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={params.get("month") ?? ""} onValueChange={(v) => update("month", v)}>
        <SelectTrigger className="min-w-[120px] h-9 text-xs">
          <SelectValue placeholder="All months" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All months</SelectItem>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
