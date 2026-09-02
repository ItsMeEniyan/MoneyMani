import { notFound } from "next/navigation"
import { getTripDetail } from "@/actions/trips"
import TripDetail from "@/components/trips/TripDetail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params
  try {
    const trip = await getTripDetail(id)
    return (
      <TripDetail
        id={trip.id}
        name={trip.name}
        status={trip.status}
        total={trip.total}
        expenses={trip.expenses}
        byCategory={trip.byCategory}
      />
    )
  } catch {
    notFound()
  }
}
