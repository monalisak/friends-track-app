"use client"

import { ReactNode } from "react"
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
  notifications = {}
}: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
