"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Plane, CheckCircle, Trash2 } from "lucide-react"
import { createTrip, deleteTrip } from "@/actions/trips"
import { formatINR } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Trip {
  id: string
  name: string
  status: "ACTIVE" | "COMPLETED"
  createdAt: string
  total: number
  expenseCount: number
}

interface Props {
  trips: Trip[]
}

export default function TripList({ trips }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    if (!name.trim()) return
    startTransition(async () => {
      try {
        const id = await createTrip(name)
        toast.success("Trip created!")
        setOpen(false)
        setName("")
        router.push(`/trips/${id}`)
      } catch {
        toast.error("Failed to create trip")
      }
    })
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("Delete this trip and all its expenses?")) return
    startTransition(async () => {
      try {
        await deleteTrip(id)
        toast.success("Trip deleted")
      } catch {
        toast.error("Failed to delete")
      }
    })
  }

  const active = trips.filter((t) => t.status === "ACTIVE")
  const completed = trips.filter((t) => t.status === "COMPLETED")

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full gap-2">
            <Plus className="h-4 w-4" /> New Trip
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Trip name</Label>
              <Input
                placeholder="e.g. Goa Trip, Ooty Weekend"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={isPending || !name.trim()}
              className="w-full"
            >
              {isPending ? "Creating..." : "Start Trip"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {trips.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Plane className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No trips yet. Start one!</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Active</p>
          {active.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDelete} onClick={() => router.push(`/trips/${trip.id}`)} />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Completed</p>
          {completed.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDelete} onClick={() => router.push(`/trips/${trip.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function TripCard({
  trip,
  onDelete,
  onClick,
}: {
  trip: Trip
  onDelete: (id: string, e: React.MouseEvent) => void
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl border bg-[hsl(var(--card))] text-left hover:bg-[hsl(var(--muted))] transition-colors active:scale-[0.98]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xl">
        ✈️
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{trip.name}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {trip.expenseCount} expense{trip.expenseCount !== 1 ? "s" : ""}
          {trip.status === "COMPLETED" && (
            <span className="ml-2 inline-flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" /> Done
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
          {formatINR(trip.total)}
        </span>
        <button
          onClick={(e) => onDelete(trip.id, e)}
          className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </button>
  )
}
