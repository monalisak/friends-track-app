"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin } from "lucide-react"

interface MeetupFormData {
  title: string
  dateTime: string
  location: string
  notes: string
}

interface MeetupFormProps {
  onSubmit: (data: MeetupFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<MeetupFormData>
}

export function MeetupForm({ onSubmit, onCancel, initialData }: MeetupFormProps) {
  const [formData, setFormData] = useState<MeetupFormData>({
    title: initialData?.title || '',
    dateTime: initialData?.dateTime || '',
    location: initialData?.location || '',
    notes: initialData?.notes || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.dateTime) return

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
          Meetup Title *
        </label>
        <Input
          type="text"
          placeholder="e.g., Weekly Coffee Catchup"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Date & Time *
        </label>
        <Input
          type="datetime-local"
          value={formData.dateTime}
          onChange={(e) => setFormData(prev => ({ ...prev, dateTime: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="e.g., Starbucks Downtown"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Notes
        </label>
        <textarea
          className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white/90 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(240,74,35,0.25)] focus:border-transparent resize-none"
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
          className="flex-1 bg-white/80 border-gray-200 hover:bg-white"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-accent text-white hover:bg-accent/90"
          disabled={loading || !formData.title || !formData.dateTime}
        >
          {loading ? 'Creating...' : 'Create Meetup'}
        </Button>
      </div>
    </form>
  )
}
