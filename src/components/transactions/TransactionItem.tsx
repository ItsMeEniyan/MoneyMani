import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { CATEGORY_ICONS } from "@/lib/constants"
import type { SerializedTransaction } from "@/types"

interface Props {
  transaction: SerializedTransaction
  onDelete?: (id: string) => void
  showDelete?: boolean
}

export default function TransactionItem({ transaction, onDelete, showDelete }: Props) {
  const icon = CATEGORY_ICONS[transaction.category] ?? "📌"
  const date = new Date(transaction.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const variant =
    transaction.type === "INCOME"
      ? "income"
      : transaction.type === "EXPENSE"
      ? "expense"
      : "savings"

  const amountColor =
    transaction.type === "INCOME"
      ? "text-green-600"
      : transaction.type === "SAVINGS"
      ? "text-blue-600"
      : "text-red-600"

  const amountPrefix = transaction.type === "INCOME" ? "+" : transaction.type === "SAVINGS" ? "→" : "-"

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[hsl(var(--border))] last:border-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{transaction.category}</span>
          <Badge variant={variant as "income" | "expense" | "savings"} className="text-[10px] py-0 px-1.5">
            {transaction.type}
          </Badge>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {date}
          {transaction.note && ` · ${transaction.note}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold tabular-nums ${amountColor}`}>
          {amountPrefix}{formatINR(transaction.amount)}
        </span>
        {showDelete && onDelete && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors p-1"
            aria-label="Delete"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
