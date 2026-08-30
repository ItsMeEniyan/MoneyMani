import { auth } from "@/lib/auth"
import { getLiabilities } from "@/actions/liabilities"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import LiabilityManager from "@/components/settings/LiabilityManager"

export default async function SettingsPage() {
  const [session, liabilities] = await Promise.all([auth(), getLiabilities()])
  const user = session?.user
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "MM"

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.name ?? "User"}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Balance Sheet Liabilities</CardTitle></CardHeader>
        <CardContent>
          <LiabilityManager initial={liabilities} />
        </CardContent>
      </Card>

      <Separator />

      <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
        MoneyMani — Your RDPD-style tracker
      </p>
    </div>
  )
}
