"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

const pageTitles: Record<string, string> = {
  "/dashboard": "MoneyMani",
  "/transactions": "Transactions",
  "/transactions/add": "Add Transaction",
  "/reports": "Reports",
  "/settings": "Settings",
  "/trips": "Trips",
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const isTopLevel =
    pathname === "/dashboard" ||
    pathname === "/transactions" ||
    pathname === "/reports" ||
    pathname === "/settings" ||
    pathname === "/trips"

  const isTripDetail = pathname.startsWith("/trips/")
  const title = isTripDetail ? "Trip" : (pageTitles[pathname] ?? "MoneyMani")
  const showBack = !isTopLevel

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 max-w-lg mx-auto">
        {showBack ? (
          <Button variant="ghost" size="icon" className="-ml-2 mr-2" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-8 mr-2" />
        )}
        <h1 className="flex-1 text-base font-semibold">{title}</h1>
        {pathname === "/dashboard" && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings" title="Settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
