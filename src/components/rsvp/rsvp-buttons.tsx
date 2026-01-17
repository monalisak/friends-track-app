"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Clock, X, RotateCcw } from "lucide-react"

interface RsvpButtonsProps {
  currentRsvp?: {
    status: 'going' | 'maybe' | 'cant'
  } | null
  onRsvp: (status: 'going' | 'maybe' | 'cant' | null) => void
}

export function RsvpButtons({ currentRsvp, onRsvp }: RsvpButtonsProps) {
  const [selectedStatus, setSelectedStatus] = useState<'going' | 'maybe' | 'cant' | null>(
    currentRsvp?.status || null
  )

  const handleRsvp = (status: 'going' | 'maybe' | 'cant' | null) => {
    setSelectedStatus(status)
    onRsvp(status)
  }

  const rsvpOptions = [
    {
      status: 'going' as const,
      label: 'Going',
      icon: Check,
      color: 'bg-green-600 hover:bg-green-700 text-white',
      selectedColor: 'bg-green-100 border-green-500 text-green-700',
    },
    {
      status: 'maybe' as const,
      label: 'Maybe',
      icon: Clock,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      selectedColor: 'bg-blue-100 border-blue-500 text-blue-700',
    },
    {
      status: 'cant' as const,
      label: 'Can\'t',
      icon: X,
      color: 'bg-red-600 hover:bg-red-700 text-white',
      selectedColor: 'bg-red-100 border-red-500 text-red-700',
    },
    {
      status: null,
      label: 'Clear',
      icon: RotateCcw,
      color: 'bg-gray-600 hover:bg-gray-700 text-white',
      selectedColor: 'bg-gray-100 border-gray-500 text-gray-700',
    },
  ]

  return (
    <div className="flex gap-2">
      {rsvpOptions.map(({ status, label, icon: Icon, color, selectedColor }) => (
        <button
          key={status || 'clear'}
          onClick={(e) => {
            e.stopPropagation() // Prevent card click navigation
            handleRsvp(status)
          }}
          className={`flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95 ${
            selectedStatus === status
              ? 'bg-accent text-white shadow-sm'
              : 'bg-accent-light text-accent hover:bg-accent hover:text-white'
          }`}
        >
          <Icon className="w-3.5 h-3.5 mr-1.5" />
          {label}
        </button>
      ))}
    </div>
  )
}
