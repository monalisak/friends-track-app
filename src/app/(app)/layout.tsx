import { UserSelector } from "@/components/user-selector"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <UserSelector />
      <div className="min-h-screen pb-20">
        <AppHeader />
        {children}
      </div>
      <BottomNav />
    </>
  )
}
