"use client"

import React from "react"
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
  children?: React.ReactNode
}

export function PlanCard({
  title,
  date,
  endDate,
  location,
  attendees,
  onEdit,
  onCardClick,
  children
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
      className="card-revolut card-revolut-hover cursor-pointer active:scale-[0.98] p-4 mb-3"
    >
      {/* Top row: badge + details + edit */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Calendar Badge - Keep existing feature */}
          <div className="w-14 h-14 rounded-2xl border border-border flex flex-col flex-shrink-0 overflow-hidden">
            <div className="bg-accent flex-1 flex items-center justify-center">
              <span className="text-white text-[11px] font-semibold tracking-wide">
                {date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              </span>
            </div>
            <div className="bg-card flex-1 flex items-center justify-center">
              <span className="text-gray-900 text-lg font-bold leading-none">
                {date.getDate()}
              </span>
            </div>
          </div>

          {/* Content Block */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[17px] font-semibold text-gray-900 leading-snug truncate">
              {title}
            </h3>

            <p className="text-sm text-gray-600 mt-0.5 leading-snug">
              {formatDate(date)}, {formatTimeRange(date, endDate)}
            </p>

            {!!location?.trim() && (
              <div className="flex items-center text-sm text-gray-600 mt-1.5">
                <MapPin className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                <span className="truncate">{location.trim()}</span>
              </div>
            )}

            <div className="mt-2">
              <AvatarStack avatars={attendees} />
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Bottom row: RSVP buttons full width */}
      {children && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}
