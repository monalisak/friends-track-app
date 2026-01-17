"use client"

import { ReactNode, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { BottomNav } from "./bottom-nav"

interface LayoutShellProps {
  children: ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
  notifications?: Record<string, number>
}

export function LayoutShell({
  children,
  activeTab = "home",
  onTabChange,
  notifications = {},
}: LayoutShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null)

  useEffect(() => {
    const el = document.getElementById("app-swipe-surface")
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const target = e.target as HTMLElement | null
      // Don't swipe-navigate when interacting with inputs/buttons/links or inside dialogs/sheets
      if (target?.closest('input, textarea, select, button, a, [role="dialog"], [data-radix-portal]')) return

      const t = e.touches[0]
      touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() }
    }

    const onTouchEnd = (e: TouchEvent) => {
      const start = touchStart.current
      touchStart.current = null
      if (!start) return

      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const dt = Date.now() - start.t

      // Horizontal swipe only: ignore if mostly vertical
      if (Math.abs(dx) < 60) return
      if (Math.abs(dx) < Math.abs(dy) * 1.2) return
      // Must be reasonably quick to avoid accidental nav while scrolling
      if (dt > 600) return

      const tabs = ["/dashboard", "/meetups", "/trips", "/away", "/profile"]
      const current =
        pathname === "/" ? "/dashboard" : (pathname?.startsWith("/meetups/") ? "/meetups" :
        pathname?.startsWith("/trips/") ? "/trips" : pathname)
      const idx = tabs.indexOf(current)
      if (idx === -1) return

      // Swipe left -> next tab, swipe right -> prev tab
      const nextIdx = dx < 0 ? idx + 1 : idx - 1
      if (nextIdx < 0 || nextIdx >= tabs.length) return
      router.push(tabs[nextIdx])
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchend", onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [pathname, router])

  return (
    <div className="min-h-screen bg-transparent">
      <main id="app-swipe-surface" className="max-w-md mx-auto px-4 py-6 pb-32">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
