"use client"

import { useState } from "react"
import { toast } from "sonner"
import { deleteLiability } from "@/actions/liabilities"
import { formatINR } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import LiabilityForm from "./LiabilityForm"
import type { SerializedLiability } from "@/types"

interface Props {
  initial: SerializedLiability[]
}

export default function LiabilityManager({ initial }: Props) {
  const [liabilities, setLiabilities] = useState(initial)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SerializedLiability | null>(null)

  function refresh() {
    window.location.reload()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this liability?")) return
    try {
      await deleteLiability(id)
      setLiabilities((prev) => prev.filter((l) => l.id !== id))
      toast.success("Deleted")
    } catch {
      toast.error("Failed to delete")
    }
  }

  const total = liabilities.reduce((s, l) => s + l.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm">Liabilities</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Total: {formatINR(total)}</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null) }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditing(null)}>+ Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Liability" : "Add Liability"}</DialogTitle>
            </DialogHeader>
            <LiabilityForm
              liability={editing ?? undefined}
              onDone={() => { setOpen(false); setEditing(null); refresh() }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {liabilities.length === 0 ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))] py-4 text-center">
          No liabilities added yet
        </p>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))]">
          {liabilities.map((l) => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{l.name}</p>
                <p className="text-sm text-red-600 font-semibold">{formatINR(l.amount)}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditing(l); setOpen(true) }}
                  className="h-8 text-xs"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(l.id)}
                  className="h-8 text-xs text-[hsl(var(--destructive))]"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        Liabilities appear in your Balance Sheet and reduce your Net Worth.
      </p>
    </div>
  )
}
