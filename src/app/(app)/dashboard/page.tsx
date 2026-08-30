import { getDashboardData } from "@/actions/transactions"
import NetWorthCard from "@/components/dashboard/NetWorthCard"
import SummaryCards from "@/components/dashboard/SummaryCards"
import RecentTransactions from "@/components/dashboard/RecentTransactions"

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <NetWorthCard
        netWorth={data.netWorth.netWorth}
        totalAssets={data.netWorth.totalAssets}
        totalLiabilities={data.netWorth.totalLiabilities}
      />
      <SummaryCards
        income={data.currentMonth.income}
        expenses={data.currentMonth.expenses}
        savings={data.currentMonth.savings}
        netCashFlow={data.currentMonth.netCashFlow}
      />
      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  )
}
