import Header from "@/components/layout/Header"
import BottomNav from "@/components/layout/BottomNav"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-24 max-w-lg mx-auto w-full px-4 py-4">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
