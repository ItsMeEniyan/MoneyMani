import { getTrips } from "@/actions/trips"
import TripList from "@/components/trips/TripList"

export default async function TripsPage() {
  const trips = await getTrips()
  return <TripList trips={trips} />
}
