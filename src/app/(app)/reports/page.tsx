import { getReportsData } from "@/actions/transactions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MonthlyBarChart from "@/components/reports/MonthlyBarChart"
import ExpensePieChart from "@/components/reports/ExpensePieChart"
import IncomeStatement from "@/components/reports/IncomeStatement"
import BalanceSheet from "@/components/reports/BalanceSheet"

export default async function ReportsPage() {
  const data = await getReportsData(6)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="monthly">
        <TabsList className="w-full grid grid-cols-4 h-auto p-1">
          <TabsTrigger value="monthly" className="text-[10px] py-1.5">Monthly</TabsTrigger>
          <TabsTrigger value="breakdown" className="text-[10px] py-1.5">Breakdown</TabsTrigger>
          <TabsTrigger value="income" className="text-[10px] py-1.5">P&amp;L</TabsTrigger>
          <TabsTrigger value="balance" className="text-[10px] py-1.5">Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <Card>
            <CardHeader><CardTitle className="text-sm">Monthly Overview (6 months)</CardTitle></CardHeader>
            <CardContent>
              <MonthlyBarChart data={data.monthlyTotals} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader><CardTitle className="text-sm">Expense Breakdown (This Month)</CardTitle></CardHeader>
            <CardContent>
              <ExpensePieChart data={data.expenseByCategory} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardHeader><CardTitle className="text-sm">Income Statement (This Month)</CardTitle></CardHeader>
            <CardContent>
              <IncomeStatement
                incomeByCategory={data.incomeByCategory}
                expenseByCategory={data.expenseByCategory}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader><CardTitle className="text-sm">Balance Sheet (All Time)</CardTitle></CardHeader>
            <CardContent>
              <BalanceSheet
                savingsByCategory={data.savingsByCategory}
                totalAssets={data.totalAssets}
                liabilities={data.liabilities}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
