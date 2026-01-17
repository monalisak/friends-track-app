"use client"

interface DateBadgeProps {
  date: Date
}

export function DateBadge({ date }: DateBadgeProps) {
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = date.getDate()

  return (
    <div className="w-14 h-14 bg-gradient-to-br from-[#F6A08B] to-[#F6A08B] rounded-xl flex flex-col items-center justify-center mr-4 flex-shrink-0">
      <div className="text-white text-xs font-medium leading-tight">
        {month}
      </div>
      <div className="text-white text-xl font-bold leading-tight">
        {day}
      </div>
    </div>
  )
}
