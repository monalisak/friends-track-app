"use client"

import { MapPin, Pencil } from "lucide-react"
import { DateBadge } from "./date-badge"
import { AvatarStack } from "./avatar-stack"

interface PlanCardProps {
  title: string
  date: Date
  endDate?: Date
  location?: string
  attendees: Array<{
    id: string
    name: string
    color: string
  }>
  onEdit?: () => void
  onCardClick?: () => void
}

export function PlanCard({
  title,
  date,
  endDate,
  location,
  attendees,
  onEdit,
  onCardClick
}: PlanCardProps) {
  const formatTimeRange = (start: Date, end?: Date) => {
    const startTime = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    if (end) {
      const endTime = end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      return `${startTime} – ${endTime}`
    }

    return startTime
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div
      onClick={onCardClick}
      className="bg-white rounded-[28px] p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] mb-4"
    >
      <div className="flex items-start">
        {/* Calendar Badge */}
        <div className="w-16 h-16 rounded-[18px] border-2 border-[#F6A08B] flex flex-col mr-4 flex-shrink-0">
          <div className="bg-[#F6A08B] rounded-t-[16px] flex-1 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
            </span>
          </div>
          <div className="bg-white rounded-b-[16px] flex-1 flex items-center justify-center">
            <span className="text-gray-900 text-xl font-bold">
              {date.getDate()}
            </span>
          </div>
        </div>

        {/* Content Block */}
        <div className="flex-1 min-w-0 mr-3">
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">
            {title}
          </h3>

          {/* Date and time */}
          <p className="text-base text-gray-600 mb-3">
            {formatDate(date)}, {formatTimeRange(date, endDate)}
          </p>

          {/* Location */}
          {location && (
            <div className="flex items-center text-base text-gray-700 mb-4">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Attendees */}
          <AvatarStack avatars={attendees} />
        </div>

        {/* Edit button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.()
          }}
          className="w-11 h-11 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0 self-start mt-1"
        >
          <Pencil className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
