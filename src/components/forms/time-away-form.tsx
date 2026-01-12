"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser } from "@/contexts/user-context"

interface TimeAwayFormData {
  startDate: string
  endDate: string
  type: 'Holiday' | 'Work' | 'Family' | 'Other'
  notes: string
}

interface TimeAwayFormProps {
  onSubmit: (data: TimeAwayFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<TimeAwayFormData>
}

export function TimeAwayForm({ onSubmit, onCancel, initialData }: TimeAwayFormProps) {
  const { currentUser, members } = useUser()
  const [formData, setFormData] = useState<TimeAwayFormData>({
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    type: initialData?.type || 'Holiday',
    notes: initialData?.notes || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.startDate || !formData.endDate) return

    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const typeOptions = [
    { value: 'Holiday', label: 'Holiday' },
    { value: 'Work', label: 'Work' },
    { value: 'Family', label: 'Family' },
    { value: 'Other', label: 'Other' },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Dates are in GMT+8 timezone</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            min={formData.startDate}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Dates are in GMT+8 timezone</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type
        </label>
        <Select
          value={formData.type}
          onValueChange={(value: 'Holiday' | 'Work' | 'Family' | 'Other') =>
            setFormData(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          disabled={loading || !formData.startDate || !formData.endDate}
        >
          {loading ? 'Adding...' : 'Add Time Away'}
        </Button>
      </div>
    </form>
  )
}
