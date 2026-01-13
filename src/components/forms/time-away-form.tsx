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
  console.log('TimeAwayForm: Component initialized with onSubmit:', typeof onSubmit)

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
    console.log('TimeAwayForm: handleSubmit called')
    console.log('TimeAwayForm: formData:', formData)

    if (!formData.startDate || !formData.endDate) {
      console.log('TimeAwayForm: Validation failed - missing dates')
      return
    }

    setLoading(true)
    console.log('TimeAwayForm: Calling onSubmit with:', formData)
    try {
      await onSubmit(formData)
      console.log('TimeAwayForm: onSubmit completed successfully')
    } catch (error) {
      console.error('TimeAwayForm: onSubmit threw error:', error)
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
    <form onSubmit={handleSubmit} className="space-y-6 px-4">
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
            className="h-11"
          />
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
            className="h-11"
          />
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
          <SelectTrigger className="h-11">
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
          className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
          placeholder="Any additional details..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex space-x-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-11"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-11"
          disabled={loading || !formData.startDate || !formData.endDate}
          onClick={() => console.log('TimeAwayForm: Submit button clicked')}
        >
          {loading ? 'Adding...' : 'Add Time Away'}
        </Button>
      </div>
    </form>
  )
}
