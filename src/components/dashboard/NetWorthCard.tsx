import { formatINR } from "@/lib/utils"

interface Props {
  netWorth: number
  totalAssets: number
  totalLiabilities: number
}

export default function NetWorthCard({ netWorth, totalAssets, totalLiabilities }: Props) {
  const isPositive = netWorth >= 0

  return (
    <div className={`rounded-2xl p-6 text-white ${isPositive ? "bg-gradient-to-br from-blue-500 to-blue-700" : "bg-gradient-to-br from-red-500 to-red-700"}`}>
      <p className="text-sm font-medium text-blue-100 mb-1">Net Worth</p>
      <p className="text-4xl font-bold mb-4">{formatINR(netWorth)}</p>
      <div className="flex justify-between text-sm">
        <div>
          <p className="text-blue-200 text-xs">Assets</p>
          <p className="font-semibold">{formatINR(totalAssets)}</p>
        </div>
        <div className="text-right">
          <p className="text-blue-200 text-xs">Liabilities</p>
          <p className="font-semibold">{formatINR(totalLiabilities)}</p>
        </div>
      </div>
    </div>
  )
}
