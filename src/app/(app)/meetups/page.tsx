"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Users, Plus, Trash2 } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useData } from "@/contexts/data-context"
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
  const router = useRouter()
  const { currentUser, members } = useUser()
  const { meetups: allMeetups, loading, createMeetup, updateMeetupRsvp, deleteMeetup } = useData()
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Filter meetups based on the selected filter
  const meetups = useMemo(() => {
    if (filter === 'upcoming') {
      return allMeetups
        .filter(meetup => new Date(meetup.date_time) >= new Date())
        .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
    } else {
      // Past: show most recent first (still chronological within "past" context)
      return allMeetups
        .filter(meetup => new Date(meetup.date_time) < new Date())
        .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
    }
  }, [allMeetups, filter])


  // Helper functions
  const getUserRsvp = (meetup: any) => {
    if (!currentUser) return null
    return meetup.rsvps.find((rsvp: any) => rsvp.member_id === currentUser.id)
  }

  const getRsvpCounts = (meetup: any) => {
    const counts = { going: 0, maybe: 0, cant: 0 }
    meetup.rsvps.forEach((rsvp: any) => {
      const status = rsvp.status as keyof typeof counts
      counts[status]++
    })
    return counts
  }

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member?.name || 'Unknown'
  }

  const handleCreateMeetup = async (data: any) => {
    await createMeetup(data)
    setShowCreateForm(false)
  }

  const handleDeleteMeetup = async (meetupId: string) => {
    await deleteMeetup(meetupId)
    setDeleteConfirm(null)
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
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <header className="mb-6">
        <div className="card-revolut p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-primary">Meetups</h1>
              <p className="text-secondary mt-1">Plan and track group gatherings</p>
            </div>
            <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
              <SheetTrigger asChild>
                <button className="bg-[#F04A23] text-white p-3 rounded-full hover:bg-[#E03F1F] transition-colors">
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
        </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-accent-light p-1 rounded-lg">
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'upcoming'
              ? 'bg-card text-primary shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'past'
              ? 'bg-card text-primary shadow-sm'
              : 'text-secondary hover:text-primary'
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {filter} meetups
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
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
              <div
                key={meetup.id}
                className="bg-white rounded-3xl p-5 cursor-pointer hover:shadow-md transition-shadow shadow-sm"
                onClick={() => router.push(`/meetups/${meetup.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{meetup.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        {formatDateTime(meetup.date_time)}
                      </span>
                    </div>
                    {meetup.location && (
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{meetup.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        {rsvpCounts.going} going • {rsvpCounts.maybe} maybe • {rsvpCounts.cant} can't
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      !userRsvp
                        ? 'bg-gray-100 text-gray-700'
                        : userRsvp.status === 'going'
                        ? 'bg-green-100 text-green-800'
                        : userRsvp.status === 'maybe'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userRsvp ? userRsvp.status : 'Not responded'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirm(meetup.id)
                      }}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                      title="Delete meetup"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Created by {getMemberName(meetup.created_by)}
                </div>
                {currentUser && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <RsvpButtons
                      currentRsvp={userRsvp}
                      onRsvp={(status) => updateMeetupRsvp(meetup.id, status)}
                    />
                  </div>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Meetup?</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
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
