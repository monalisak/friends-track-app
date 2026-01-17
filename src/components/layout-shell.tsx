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
  fabLabel?: string
}

export function LayoutShell({
  children,
  activeTab = "home",
  onTabChange,
  notifications = {},
  onFabClick,
  fabLabel = "Add new plan"
}: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Main content area */}
      <main className="max-w-md mx-auto px-4 pt-6 pb-24">
        {children}
      </main>

      {/* Floating action button */}
      <FloatingActionButton onClick={onFabClick} label={fabLabel} />

      {/* Bottom navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        notifications={notifications}
      />
    </div>
  )
}
