"use client"

import { Calendar } from "lucide-react"

interface DateBadgeProps {
  date: Date
  color?: string
}

export function DateBadge({ date, color = "#F6A08B" }: DateBadgeProps) {
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = date.getDate()

  return (
    <div
      className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center mr-4 flex-shrink-0 relative"
      style={{ backgroundColor: color }}
    >
      <Calendar className="w-5 h-5 text-white/80 absolute top-1" />
      <div className="text-white text-xs font-medium leading-tight mt-2">
        {month}
      </div>
      <div className="text-white text-lg font-bold leading-tight">
        {day}
      </div>
    </div>
  )
}
