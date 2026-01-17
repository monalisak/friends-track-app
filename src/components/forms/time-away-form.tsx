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
    if (!formData.startDate || !formData.endDate) {
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('TimeAwayForm submit error:', error)
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Start Date *
          </label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
            className="h-11"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            End Date *
          </label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            min={formData.startDate}
            required
            className="h-11"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Type
        </label>
        <Select
          value={formData.type}
          onValueChange={(value: 'Holiday' | 'Work' | 'Family' | 'Other') =>
            setFormData(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="h-11 bg-white/90 border-gray-200 focus:ring-2 focus:ring-[rgba(240,74,35,0.25)]">
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
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Location / Notes
        </label>
        <textarea
          className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white/90 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(240,74,35,0.25)] focus:border-transparent resize-none h-20"
          placeholder="e.g., Bali / Japan / Work trip (optional)"
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
          disabled={loading || !formData.startDate || !formData.endDate}
        >
          {loading ? 'Adding...' : 'Add Time Away'}
        </Button>
      </div>
    </form>
  )
}
