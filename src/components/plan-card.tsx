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
      <div className="flex items-start">
        {/* Calendar Badge - Keep existing feature */}
        <div className="w-14 h-14 rounded-xl border-2 border-accent flex flex-col mr-4 flex-shrink-0">
          <div className="bg-accent rounded-t-lg flex-1 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
            </span>
          </div>
          <div className="bg-card rounded-b-lg flex-1 flex items-center justify-center">
            <span className="text-gray-900 text-lg font-bold">
              {date.getDate()}
            </span>
          </div>
        </div>

        {/* Content Block */}
        <div className="flex-1 min-w-0 mr-3">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {title}
          </h3>

          {/* Date and time */}
          <p className="text-sm text-gray-600 mb-2">
            {formatDate(date)}, {formatTimeRange(date, endDate)}
          </p>

          {/* Location */}
          {location && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <MapPin className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Attendees */}
          <AvatarStack avatars={attendees} />
        </div>

        {/* RSVP Buttons */}
        {children && (
          <div className="mt-3 pt-3 border-t border-border">
            {children}
          </div>
        )}

        {/* Edit button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.()
          }}
          className="w-9 h-9 bg-border hover:bg-muted rounded-full flex items-center justify-center transition-colors flex-shrink-0 self-start"
        >
          <Pencil className="w-4 h-4 text-secondary" />
        </button>
      </div>
    </div>
  )
}
