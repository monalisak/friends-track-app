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
      className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] mb-4"
    >
      <div className="flex items-start">
        <DateBadge date={date} />

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
            {title}
          </h3>

          {/* Date and time */}
          <p className="text-sm text-gray-600 mb-2">
            {formatDate(date)}, {formatTimeRange(date, endDate)}
          </p>

          {/* Location */}
          {location && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
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
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center ml-3 transition-colors flex-shrink-0"
        >
          <Pencil className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
