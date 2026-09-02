"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { deleteTransaction } from "@/actions/transactions"
import TransactionItem from "./TransactionItem"
import type { SerializedTransaction } from "@/types"

interface Props {
  transactions: SerializedTransaction[]
}

export default function TransactionList({ transactions: initial }: Props) {
  const [transactions, setTransactions] = useState(initial)

  useEffect(() => {
    setTransactions(initial)
  }, [initial])

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return
    try {
      await deleteTransaction(id)
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      toast.success("Deleted")
    } catch {
      toast.error("Failed to delete")
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
        <p className="text-3xl mb-2">📂</p>
        <p className="text-sm">No transactions found</p>
        <p className="text-xs">Try changing the filters</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4">
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} onDelete={handleDelete} showDelete />
      ))}
    </div>
  )
}
