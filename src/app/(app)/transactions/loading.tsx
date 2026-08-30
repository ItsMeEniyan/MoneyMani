import { Skeleton } from "@/components/ui/skeleton"

export default function TransactionsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
    </div>
  )
}
