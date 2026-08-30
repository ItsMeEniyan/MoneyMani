import { formatINR } from "@/lib/utils"

interface Props {
  income: number
  expenses: number
  savings: number
  netCashFlow: number
}

export default function SummaryCards({ income, expenses, savings, netCashFlow }: Props) {
  const cards = [
    { label: "Income", value: income, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    { label: "Expenses", value: expenses, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    { label: "Savings", value: savings, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "Cash Flow", value: netCashFlow, color: netCashFlow >= 0 ? "text-green-600" : "text-red-600", bg: netCashFlow >= 0 ? "bg-green-50" : "bg-red-50", border: netCashFlow >= 0 ? "border-green-200" : "border-red-200" },
  ]

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-3">This Month</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.bg} ${card.border}`}>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{card.label}</p>
            <p className={`text-lg font-bold tabular-nums ${card.color}`}>{formatINR(card.value)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
