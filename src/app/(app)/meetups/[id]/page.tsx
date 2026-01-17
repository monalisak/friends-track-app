"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, Users, Pencil } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useData } from "@/contexts/data-context"
import { RsvpButtons } from "@/components/rsvp/rsvp-buttons"
import { MeetupForm } from "@/components/forms/meetup-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatDateTime } from "@/lib/date-utils"

interface Meetup {
  id: string
  title: string
  date_time: string
  location?: string
  notes?: string
  created_by: string
  rsvps: Array<{
    id: string
    member_id: string
    status: 'going' | 'maybe' | 'cant'
  }>
}

export default function MeetupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { currentUser, members } = useUser()
  const { meetups, loading, updateMeetupRsvp, updateMeetup } = useData()
  const [showEdit, setShowEdit] = useState(false)

  const meetup = useMemo(() => {
    const id = params.id as string | undefined
    if (!id) return null
    return (meetups as any as Meetup[]).find(m => m.id === id) || null
  }, [meetups, params.id])

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member?.name || 'Unknown'
  }

  const getMemberColor = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member?.color || '#6b7280'
  }

  const getRsvpCounts = (rsvps: Meetup['rsvps']) => {
    const counts = { going: 0, maybe: 0, cant: 0 }
    rsvps.forEach(rsvp => {
      counts[rsvp.status]++
    })
    return counts
  }

  const getUserRsvp = (rsvps: Meetup['rsvps']) => {
    if (!currentUser) return null
    return rsvps.find(rsvp => rsvp.member_id === currentUser.id)
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

  if (!meetup) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Meetup not found</h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  const rsvpCounts = getRsvpCounts(meetup.rsvps)
  const userRsvp = getUserRsvp(meetup.rsvps)

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white ml-2">Meetup Details</h1>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          title="Edit meetup"
        >
          <Pencil className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Meetup Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{meetup.title}</h2>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{formatDateTime(meetup.date_time)}</span>
          </div>

          {meetup.location && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{meetup.location}</span>
            </div>
          )}

          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Users className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>
              {rsvpCounts.going} going • {rsvpCounts.maybe} maybe • {rsvpCounts.cant} can't
            </span>
          </div>
        </div>

        {meetup.notes && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300">{meetup.notes}</p>
          </div>
        )}
      </div>

      {/* RSVP Section */}
      {currentUser && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Response</h3>
          <RsvpButtons
            currentRsvp={userRsvp}
            onRsvp={(status) => updateMeetupRsvp(meetup.id, status)}
          />
        </div>
      )}

      {/* RSVP Responses */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Responses</h3>

        {meetup.rsvps.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No responses yet</p>
        ) : (
          <div className="space-y-3">
            {meetup.rsvps.map(rsvp => (
              <div key={rsvp.id} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3"
                    style={{ backgroundColor: getMemberColor(rsvp.member_id) }}
                  >
                    {getMemberName(rsvp.member_id).charAt(0)}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getMemberName(rsvp.member_id)}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rsvp.status === 'going' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  rsvp.status === 'maybe' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {rsvp.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Meetup Sheet */}
      <Sheet open={showEdit} onOpenChange={setShowEdit}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="p-6 pb-0">
            <SheetHeader>
              <SheetTitle>Edit Meetup</SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <MeetupForm
              initialData={{
                title: meetup.title,
                dateTime: meetup.date_time,
                location: meetup.location || '',
                notes: meetup.notes || '',
              }}
              onSubmit={async (data) => {
                await updateMeetup(meetup.id, data)
                setShowEdit(false)
              }}
              onCancel={() => setShowEdit(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
