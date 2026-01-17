"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin } from "lucide-react"

interface TripFormData {
  title: string
  startDate: string
  endDate: string
  location: string
  notes: string
}

interface TripFormProps {
  onSubmit: (data: TripFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<TripFormData>
}

export function TripForm({ onSubmit, onCancel, initialData }: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    title: initialData?.title || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    location: initialData?.location || '',
    notes: initialData?.notes || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.startDate || !formData.endDate) return

    // Additional validation: ensure end date is not before start date
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('End date cannot be before start date')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Trip Title *
        </label>
        <Input
          type="text"
          placeholder="e.g., Japan Ski Trip"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
          className="h-11"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Start Date *
          </label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              const nextStart = e.target.value
              setFormData(prev => {
                const nextEnd =
                  prev.endDate && nextStart && new Date(prev.endDate) < new Date(nextStart)
                    ? ''
                    : prev.endDate
                return { ...prev, startDate: nextStart, endDate: nextEnd }
              })
            }}
            required
            className="h-11 w-full"
          />
        </div>
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            End Date *
          </label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            min={formData.startDate}
            required
            className="h-11 w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="e.g., Niseko, Japan"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="pl-10 h-11"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Notes
        </label>
        <textarea
          className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white/90 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(240,74,35,0.25)] focus:border-transparent resize-none h-20"
          placeholder="Any additional details..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex space-x-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-11 bg-white/80 border-gray-200 hover:bg-white"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-11 bg-accent text-white hover:bg-accent/90"
          disabled={loading || !formData.title || !formData.startDate || !formData.endDate}
        >
          {loading ? 'Creating...' : 'Create Trip'}
        </Button>
      </div>
    </form>
  )
}
