"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createLiability, updateLiability } from "@/actions/liabilities"
import { liabilitySchema, type LiabilityInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SerializedLiability } from "@/types"

interface Props {
  liability?: SerializedLiability
  onDone: () => void
}

export default function LiabilityForm({ liability, onDone }: Props) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LiabilityInput>({
    resolver: zodResolver(liabilitySchema),
    defaultValues: { name: liability?.name ?? "", amount: liability?.amount ?? 0 },
  })

  async function onSubmit(data: LiabilityInput) {
    setLoading(true)
    try {
      if (liability) {
        await updateLiability(liability.id, data)
        toast.success("Liability updated")
      } else {
        await createLiability(data)
        toast.success("Liability added")
      }
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input placeholder="e.g. Home Loan, Car Loan" {...register("name")} />
        {errors.name && <p className="text-sm text-[hsl(var(--destructive))]">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Amount (₹)</Label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && <p className="text-sm text-[hsl(var(--destructive))]">{errors.amount.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onDone} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : liability ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  )
}
