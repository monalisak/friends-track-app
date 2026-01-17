"use client"

interface DateBadgeProps {
  date: Date
  color?: string
}

export function DateBadge({ date, color = "#F6A08B" }: DateBadgeProps) {
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = date.getDate()

  return (
    <div
      className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center mr-4 flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      <div className="text-white text-xs font-medium leading-tight">
        {month}
      </div>
      <div className="text-white text-xl font-bold leading-tight">
        {day}
      </div>
    </div>
  )
}
