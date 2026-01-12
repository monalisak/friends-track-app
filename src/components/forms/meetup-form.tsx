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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Any additional details..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={loading || !formData.title || !formData.dateTime}
        >
          {loading ? 'Creating...' : 'Create Meetup'}
        </Button>
      </div>
    </form>
  )
}
