"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatMonthLabel } from "@/lib/utils"
import type { MonthlyTotal } from "@/types"

interface Props {
  data: MonthlyTotal[]
}

function formatK(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

export default function MonthlyBarChart({ data }: Props) {
  const chartData = data.map((d) => ({
    month: formatMonthLabel(d.month),
    Income: Math.round(d.income),
    Expenses: Math.round(d.expenses),
    Savings: Math.round(d.savings),
  }))

  if (data.every((d) => d.income === 0 && d.expenses === 0 && d.savings === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-[hsl(var(--muted-foreground))] text-sm">
        No data for this period
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={formatK} width={50} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, name]}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Savings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
