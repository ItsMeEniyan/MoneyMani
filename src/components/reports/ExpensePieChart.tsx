"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { CategoryTotal } from "@/types"

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f43f5e"]

interface Props {
  data: CategoryTotal[]
}

export default function ExpensePieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[hsl(var(--muted-foreground))] text-sm">
        No expenses this month
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <div>
      <p className="text-xs text-center text-[hsl(var(--muted-foreground))] mb-2">
        Total: ₹{total.toLocaleString("en-IN")}
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip formatter={(v: any) => `₹${Number(v ?? 0).toLocaleString("en-IN")}`} contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
