import { UserSelector } from "@/components/user-selector"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { SwipeNavigation } from "@/components/swipe-navigation"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <UserSelector />
      <SwipeNavigation />
      <div className="min-h-screen pb-20">
        <AppHeader />
        {children}
      </div>
      <BottomNav />
    </>
  )
}
