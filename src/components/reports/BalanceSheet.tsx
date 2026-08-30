import { formatINR } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import type { CategoryTotal, SerializedLiability } from "@/types"

interface Props {
  savingsByCategory: CategoryTotal[]
  totalAssets: number
  liabilities: SerializedLiability[]
}

export default function BalanceSheet({ savingsByCategory, totalAssets, liabilities }: Props) {
  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0)
  const netWorth = totalAssets - totalLiabilities

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">Assets</h3>
        {savingsByCategory.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No savings recorded yet</p>
        ) : (
          savingsByCategory.map((cat) => (
            <div key={cat.category} className="flex justify-between py-1 text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">{cat.category}</span>
              <span className="font-medium text-blue-600">{formatINR(cat.amount)}</span>
            </div>
          ))
        )}
        <div className="flex justify-between py-2 font-semibold border-t border-[hsl(var(--border))] text-sm">
          <span>Total Assets</span>
          <span className="text-blue-600">{formatINR(totalAssets)}</span>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">Liabilities</h3>
        {liabilities.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No liabilities — go to Settings to add</p>
        ) : (
          liabilities.map((l) => (
            <div key={l.id} className="flex justify-between py-1 text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">{l.name}</span>
              <span className="font-medium text-red-600">{formatINR(l.amount)}</span>
            </div>
          ))
        )}
        <div className="flex justify-between py-2 font-semibold border-t border-[hsl(var(--border))] text-sm">
          <span>Total Liabilities</span>
          <span className="text-red-600">{formatINR(totalLiabilities)}</span>
        </div>
      </div>

      <Separator />

      <div className={`flex justify-between py-3 px-4 rounded-xl font-bold text-base ${netWorth >= 0 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
        <span>Net Worth</span>
        <span>{formatINR(netWorth)}</span>
      </div>
    </div>
  )
}
