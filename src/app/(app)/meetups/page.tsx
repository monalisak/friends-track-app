"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, Plus, Trash2 } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/utils/supabase"
import { MeetupForm } from "@/components/forms/meetup-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { RsvpButtons } from "@/components/rsvp/rsvp-buttons"
import { formatDateTime } from "@/lib/date-utils"

interface Meetup {
  id: string
  title: string
  date_time: string
  location?: string
  notes?: string
  created_by: string
  rsvps: Array<{
    member_id: string
    status: 'going' | 'maybe' | 'cant'
  }>
}

export default function MeetupsPage() {
  const { currentUser, members } = useUser()
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchMeetups()

    // Set up real-time subscriptions for meetups and RSVPs
    const meetupsSubscription = supabase
      .channel('meetups_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetups' }, () => {
        fetchMeetups()
      })
      .subscribe()

    const rsvpsSubscription = supabase
      .channel('rsvps_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, () => {
        fetchMeetups()
      })
      .subscribe()

    return () => {
      meetupsSubscription.unsubscribe()
      rsvpsSubscription.unsubscribe()
    }
  }, [filter])

  const fetchMeetups = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('meetups')
        .select(`
          *,
          rsvps(*)
        `)
        .order('date_time', { ascending: filter === 'upcoming' })

      if (filter === 'upcoming') {
        query = query.gte('date_time', new Date().toISOString())
      } else {
        query = query.lt('date_time', new Date().toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching meetups:', error)
      } else {
        setMeetups(data || [])
      }
    } catch (error) {
      console.error('Error fetching meetups:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserRsvp = (meetup: Meetup) => {
    if (!currentUser) return null
    return meetup.rsvps.find(rsvp => rsvp.member_id === currentUser.id)
  }

  const getRsvpCounts = (meetup: Meetup) => {
    const counts = { going: 0, maybe: 0, cant: 0 }
    meetup.rsvps.forEach(rsvp => {
      counts[rsvp.status]++
    })
    return counts
  }

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member?.name || 'Unknown'
  }

  const handleRsvpUpdate = async (meetupId: string, status: 'going' | 'maybe' | 'cant') => {
    if (!currentUser) return

    try {
      const { error } = await supabase
        .from('rsvps')
        .upsert({
          meetup_id: meetupId,
          member_id: currentUser.id,
          status,
        })

      if (error) {
        console.error('Error updating RSVP:', error)
      } else {
        fetchMeetups() // Refresh data
      }
    } catch (error) {
      console.error('Error updating RSVP:', error)
    }
  }

  const handleCreateMeetup = async (data: any) => {
    if (!currentUser) return

    try {
      const { error } = await supabase
        .from('meetups')
        .insert({
          title: data.title,
          date_time: data.dateTime,
          location: data.location || null,
          notes: data.notes || null,
          created_by: currentUser.id,
        })

      if (error) {
        console.error('Error creating meetup:', error)
      } else {
        setShowCreateForm(false)
        fetchMeetups()
      }
    } catch (error) {
      console.error('Error creating meetup:', error)
    }
  }

  const handleDeleteMeetup = async (meetupId: string) => {
    try {
      const { error } = await supabase
        .from('meetups')
        .delete()
        .eq('id', meetupId)

      if (error) {
        console.error('Error deleting meetup:', error)
      } else {
        setDeleteConfirm(null)
        fetchMeetups()
      }
    } catch (error) {
      console.error('Error deleting meetup:', error)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Meetups</h1>
          <p className="text-gray-600 mt-1">Plan and track group gatherings</p>
        </div>
        <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
          <SheetTrigger asChild>
            <button className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle>Create Meetup</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <MeetupForm
                onSubmit={handleCreateMeetup}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
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
          onClick={() => setFilter('past')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'past'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past
        </button>
      </div>

      {/* Meetups List */}
      <div className="space-y-4">
        {meetups.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filter} meetups
            </h3>
            <p className="text-gray-600">
              {filter === 'upcoming'
                ? 'Create a new meetup to get started!'
                : 'Your past meetups will appear here.'
              }
            </p>
          </div>
        ) : (
          meetups.map((meetup) => {
            const userRsvp = getUserRsvp(meetup)
            const rsvpCounts = getRsvpCounts(meetup)

            return (
              <div key={meetup.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{meetup.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    !userRsvp
                      ? 'bg-gray-100 text-gray-800'
                      : userRsvp.status === 'going'
                      ? 'bg-green-100 text-green-800'
                      : userRsvp.status === 'maybe'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userRsvp ? userRsvp.status : 'Not responded'}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 text-sm mb-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    {formatDateTime(meetup.date_time)}
                  </span>
                </div>
                {meetup.location && (
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{meetup.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    <span>
                      {rsvpCounts.going} going • {rsvpCounts.maybe} maybe • {rsvpCounts.cant} can't
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      Created by {getMemberName(meetup.created_by)}
                    </div>
                    <button
                      onClick={() => setDeleteConfirm(meetup.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                      title="Delete meetup"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {currentUser && (
                  <RsvpButtons
                    currentRsvp={userRsvp}
                    onRsvp={(status) => handleRsvpUpdate(meetup.id, status)}
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Meetup?</h3>
            <p className="text-gray-600 text-sm mb-6">
              This will permanently delete this meetup and all RSVPs. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMeetup(deleteConfirm)}
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
