"use client"

import { ReactNode } from "react"
import { BottomNav } from "./bottom-nav"
import { FloatingActionButton } from "./floating-action-button"

interface LayoutShellProps {
  children: ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
  notifications?: Record<string, number>
  onFabClick?: () => void
}

export function LayoutShell({
  children,
  activeTab = "home",
  onTabChange,
  notifications = {},
  onFabClick
}: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {children}
      </main>
      <FloatingActionButton onClick={onFabClick} />
      <BottomNav />
    </div>
  )
}
