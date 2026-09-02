import { Skeleton } from "@/components/ui/skeleton"

export default function TripsLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}
