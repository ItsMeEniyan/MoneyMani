import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
      <div>
        <Skeleton className="h-4 w-16 mb-3" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl mb-2" />)}
      </div>
    </div>
  )
}
