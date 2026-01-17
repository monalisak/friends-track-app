"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"

/**
 * Global swipe navigation between bottom-nav tabs.
 * Mounted once in the (app) layout so it works on every page.
 */
export function SwipeNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null)
  const isAnimating = useRef(false)

  // On route change, if a swipe navigation was requested, animate the new page in.
  useEffect(() => {
    const pending = sessionStorage.getItem("swipePending")
    const dir = sessionStorage.getItem("swipeDir") as "left" | "right" | null
    if (!pending || !dir) return

    sessionStorage.removeItem("swipePending")
    sessionStorage.removeItem("swipeDir")

    // Prepare enter animation without transition, then animate to idle.
    const html = document.documentElement
    html.dataset.swipeDir = dir
    html.dataset.swipePhase = "in"
    html.classList.add("swipe-no-transition")

    requestAnimationFrame(() => {
      html.classList.remove("swipe-no-transition")
      html.dataset.swipePhase = "idle"
      window.setTimeout(() => {
        html.dataset.swipePhase = ""
        isAnimating.current = false
      }, 320)
    })
  }, [pathname])

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const target = e.target as HTMLElement | null
      // Ignore gestures that start from interactive elements or inside dialogs/sheets
      if (target?.closest('input, textarea, select, button, a, [role="dialog"]')) return
      if (document.querySelector('[data-radix-portal] [role="dialog"]')) return

      const t = e.touches[0]
      touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (isAnimating.current) return
      const start = touchStart.current
      touchStart.current = null
      if (!start) return

      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const dt = Date.now() - start.t

      // Horizontal swipe only
      if (Math.abs(dx) < 60) return
      if (Math.abs(dx) < Math.abs(dy) * 1.2) return
      if (dt > 650) return

      const tabs = ["/dashboard", "/meetups", "/trips", "/away", "/profile"]

      const current =
        pathname === "/" ? "/dashboard"
        : pathname?.startsWith("/meetups/") ? "/meetups"
        : pathname?.startsWith("/trips/") ? "/trips"
        : pathname

      const idx = tabs.indexOf(current)
      if (idx === -1) return

      const nextIdx = dx < 0 ? idx + 1 : idx - 1
      if (nextIdx < 0 || nextIdx >= tabs.length) return

      const dir = dx < 0 ? "left" : "right"
      const nextHref = tabs[nextIdx]

      isAnimating.current = true
      const html = document.documentElement
      html.dataset.swipeDir = dir
      html.dataset.swipePhase = "out"

      // Remember that the next route change should animate in.
      sessionStorage.setItem("swipePending", "1")
      sessionStorage.setItem("swipeDir", dir)

      // Let the "out" animation start, then navigate.
      window.setTimeout(() => {
        router.push(nextHref)
      }, 140)
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true })
    document.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener("touchstart", onTouchStart)
      document.removeEventListener("touchend", onTouchEnd)
    }
  }, [pathname, router])

  return null
}


