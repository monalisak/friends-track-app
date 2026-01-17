"use client"

import { useState, useEffect } from "react"
import { Clock, Plus, Trash2 } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/utils/supabase"
import { TimeAwayForm } from "@/components/forms/time-away-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface TimeAway {
  id: string
  member_id: string
  start_date: string
  end_date: string
  type?: 'Holiday' | 'Work' | 'Family' | 'Other'
  notes?: string
  created_by: string
}

export default function AwayPage() {
  const { currentUser, members } = useUser()
  const [timeAwayEntries, setTimeAwayEntries] = useState<TimeAway[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<'upcoming' | 'all'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    // Test Supabase connection first
    const testConnection = async () => {
      try {
        console.log('Client-side: Testing Supabase connection...')
        const { data, error } = await supabase.from('members').select('count').limit(1)
        if (error) {
          console.error('Client-side: Supabase connection test failed:', error)
        } else {
          console.log('Client-side: Supabase connection OK')
        }
      } catch (err) {
        console.error('Client-side: Supabase test exception:', err)
      }
    }

    testConnection()
    fetchTimeAway()

    // Set up real-time subscriptions
    const timeAwaySubscription = supabase
      .channel('time_away_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_away' }, () => {
        console.log('Client-side: Real-time update triggered for time_away')
        fetchTimeAway()
      })
      .subscribe()

    return () => {
      timeAwaySubscription.unsubscribe()
    }
  }, [filter])

  const fetchTimeAway = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('time_away')
        .select(`
          *,
          members!member_id(*)
        `)

      if (filter === 'upcoming') {
        query = query.gte('end_date', new Date().toISOString().split('T')[0])
      }

      query = query.order('start_date', { ascending: true })

      console.log('Client-side: Executing time away query...')
      const { data, error } = await query

      if (error) {
        console.error('Client-side: Error fetching time away:', error)
        // Check if it's a table not found error
        if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
          const err = error as { code?: string; message?: string }
          if (err.code === 'PGRST116' || err.message?.includes('relation') || err.message?.includes('does not exist')) {
            console.error('Client-side: Database tables not found. Please run the SQL setup in Supabase.')
          }
        }
      } else {
        console.log('Client-side: Fetched time away data:', data)
        console.log('Client-side: Number of entries:', data?.length || 0)
        if (data && data.length > 0) {
          console.log('Client-side: First entry:', data[0])
          console.log('Client-side: First entry has members:', !!data[0].members)
        }
        setTimeAwayEntries(data || [])
      }
    } catch (error) {
      console.error('Client-side: Exception fetching time away:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member?.name || 'Unknown'
  }

  const getMemberColor = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member?.color || '#6b7280'
  }

  const handleCreateTimeAway = async (data: any) => {
    if (!currentUser) return

    console.log('Creating time away with data:', data)
    console.log('Current user:', currentUser)

    try {
      const insertData = {
        member_id: currentUser.id,
        start_date: data.startDate,
        end_date: data.endDate,
        type: data.type || null,
        notes: data.notes || null,
        created_by: currentUser.id,
      }

      console.log('Inserting data:', insertData)

      const { data: result, error } = await supabase
        .from('time_away')
        .insert(insertData)
        .select()

      if (error) {
        console.error('Error creating time away:', error)
        console.error('Error details:', error.message, error.details, error.hint)
      } else {
        console.log('Time away created successfully:', result)
        setShowCreateForm(false)
        fetchTimeAway()
      }
    } catch (error) {
      console.error('Exception creating time away:', error)
    }
  }

  const handleDeleteTimeAway = async (timeAwayId: string) => {
    try {
      const { error } = await supabase
        .from('time_away')
        .delete()
        .eq('id', timeAwayId)

      if (error) {
        console.error('Error deleting time away:', error)
      } else {
        setDeleteConfirm(null)
        fetchTimeAway()
      }
    } catch (error) {
      console.error('Error deleting time away:', error)
    }
  }

  // Group entries by member
  const groupedEntries = timeAwayEntries.reduce((acc, entry) => {
    const memberId = entry.member_id
    if (!acc[memberId]) {
      acc[memberId] = []
    }
    acc[memberId].push(entry)
    return acc
  }, {} as Record<string, TimeAway[]>)

  // Client-side logging only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Client-side: Time away entries:', timeAwayEntries.length)
      console.log('Client-side: Grouped entries:', Object.keys(groupedEntries).length, 'members')
      if (timeAwayEntries.length > 0) {
        console.log('Client-side: First entry:', timeAwayEntries[0])
      }
    }
  }, [timeAwayEntries, groupedEntries])

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Time Away</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Share when you're traveling</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              console.log('Client-side: Manual refresh triggered')
              fetchTimeAway()
            }}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Refresh
          </button>
          <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
            <SheetTrigger asChild>
        <button className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
            </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] p-0">
            <div className="p-6 pb-0">
              <SheetHeader>
                <SheetTitle>Add Time Away</SheetTitle>
              </SheetHeader>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <TimeAwayForm
                onSubmit={handleCreateTimeAway}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'upcoming'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All
        </button>
      </div>

      {/* Time Away by Member */}
      <div className="space-y-6">
        {Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No time away entries
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Add your travel plans to let others know when you're away.
            </p>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([memberId, entries]) => {
            console.log(`Rendering member ${memberId} with ${entries.length} entries`)
            return (
            <section key={memberId}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2"
                  style={{ backgroundColor: getMemberColor(memberId) }}
                >
                  {getMemberName(memberId).charAt(0)}
                </div>
                {getMemberName(memberId)}
                {memberId === currentUser?.id && (
                  <span className="text-xs text-blue-600 ml-2">(You)</span>
                )}
              </h2>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {entry.type || 'Time Away'}
                        </p>
                        {entry.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{entry.notes}</p>
                        )}
                </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                            <span>
                              {new Date(entry.start_date).toLocaleDateString()} - {new Date(entry.end_date).toLocaleDateString()}
                            </span>
                </div>
              </div>
                        <button
                          onClick={() => setDeleteConfirm(entry.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                          title="Delete time away"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
            </div>
          </div>
        </div>
                ))}
              </div>
            </section>
            )
          })
        )}
          </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Time Away?</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              This will permanently delete this time away entry. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTimeAway(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
