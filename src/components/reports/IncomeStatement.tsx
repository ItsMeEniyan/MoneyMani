import { formatINR } from "@/lib/utils"
import { INCOME_GROUPS } from "@/lib/constants"
import { Separator } from "@/components/ui/separator"
import type { CategoryTotal } from "@/types"

interface Props {
  incomeByCategory: CategoryTotal[]
  expenseByCategory: CategoryTotal[]
}

export default function IncomeStatement({ incomeByCategory, expenseByCategory }: Props) {
  const totalIncome = incomeByCategory.reduce((s, c) => s + c.amount, 0)
  const totalExpenses = expenseByCategory.reduce((s, c) => s + c.amount, 0)
  const netCashFlow = totalIncome - totalExpenses

  const catMap = Object.fromEntries(incomeByCategory.map((c) => [c.category, c.amount]))

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">Income</h3>
        {Object.entries(INCOME_GROUPS).map(([group, cats]) => {
          const groupTotal = cats.reduce((s, c) => s + (catMap[c] ?? 0), 0)
          if (groupTotal === 0) return null
          return (
            <div key={group} className="mb-3">
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1">{group}</p>
              {cats.map((cat) => {
                const amt = catMap[cat] ?? 0
                if (amt === 0) return null
                return (
                  <div key={cat} className="flex justify-between py-1 text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">{cat}</span>
                    <span className="font-medium text-green-600">{formatINR(amt)}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
        {totalIncome === 0 && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No income this month</p>
        )}
        <div className="flex justify-between py-2 font-semibold border-t border-[hsl(var(--border))] text-sm">
          <span>Total Income</span>
          <span className="text-green-600">{formatINR(totalIncome)}</span>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">Expenses</h3>
        {expenseByCategory.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No expenses this month</p>
        ) : (
          expenseByCategory.map((cat) => (
            <div key={cat.category} className="flex justify-between py-1 text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">{cat.category}</span>
              <span className="font-medium text-red-600">{formatINR(cat.amount)}</span>
            </div>
          ))
        )}
        <div className="flex justify-between py-2 font-semibold border-t border-[hsl(var(--border))] text-sm">
          <span>Total Expenses</span>
          <span className="text-red-600">{formatINR(totalExpenses)}</span>
        </div>
      </div>

      <Separator />

      <div className={`flex justify-between py-3 px-4 rounded-xl font-bold text-base ${netCashFlow >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
        <span>Net Cash Flow</span>
        <span>{formatINR(netCashFlow)}</span>
      </div>
    </div>
  )
}
