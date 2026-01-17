"use client"

import { Plus } from "lucide-react"

interface FloatingActionButtonProps {
  onClick?: () => void
  label?: string
}

export function FloatingActionButton({
  onClick,
  label = "Add new plan"
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 bg-[#F04A23] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center space-x-2 z-50"
      style={{
        boxShadow: "0 8px 32px rgba(240, 74, 35, 0.3)",
        borderRadius: "9999px"
      }}
    >
      <Plus className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
