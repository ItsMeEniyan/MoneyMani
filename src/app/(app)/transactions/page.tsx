import { Suspense } from "react"
import { getTransactions } from "@/actions/transactions"
import TransactionFilters from "@/components/transactions/TransactionFilters"
import TransactionList from "@/components/transactions/TransactionList"
import { Skeleton } from "@/components/ui/skeleton"

interface PageProps {
  searchParams: Promise<{ type?: string; category?: string; month?: string }>
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const filters = await searchParams
  const transactions = await getTransactions(filters)

  return (
    <div className="space-y-4">
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <TransactionFilters />
      </Suspense>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</p>
      <TransactionList transactions={transactions} />
    </div>
  )
}
