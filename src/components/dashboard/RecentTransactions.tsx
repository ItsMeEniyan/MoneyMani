import Link from "next/link"
import TransactionItem from "@/components/transactions/TransactionItem"
import type { SerializedTransaction } from "@/types"

interface Props {
  transactions: SerializedTransaction[]
}

export default function RecentTransactions({ transactions }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Recent</h2>
        <Link href="/transactions" className="text-xs text-[hsl(var(--primary))] font-medium">
          View all →
        </Link>
      </div>
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">No transactions yet</p>
          <p className="text-xs">Tap + to add your first one</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4">
          {transactions.map((t) => (
            <TransactionItem key={t.id} transaction={t} />
          ))}
        </div>
      )}
    </div>
  )
}
