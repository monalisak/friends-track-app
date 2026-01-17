"use client"

import { useState, useMemo } from "react"
import { Calendar, MapPin, Users, Clock, Plus, Plane, Pencil } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useData } from "@/contexts/data-context"
import { MeetupForm } from "@/components/forms/meetup-form"
import { TripForm } from "@/components/forms/trip-form"
import { TimeAwayForm } from "@/components/forms/time-away-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { RsvpButtons } from "@/components/rsvp/rsvp-buttons"
import { LayoutShell } from "@/components/layout-shell"
import { PlanCard } from "@/components/plan-card"
import { DateBadge } from "@/components/date-badge"
import { AvatarStack } from "@/components/avatar-stack"
import { formatDateTime } from "@/lib/date-utils"

export function DashboardContent() {
  const { currentUser, members } = useUser()
  const {
    meetups: allMeetups,
    trips: allTrips,
    timeAway: allTimeAway,
    loading,
    setupRequired,
    updateMeetupRsvp,
    updateTripRsvp,
    updateMeetup,
    updateTrip,
    createMeetup,
    createTrip,
    createTimeAway
  } = useData()

  const [showEditMeetup, setShowEditMeetup] = useState<any>(null)
  const [showEditTrip, setShowEditTrip] = useState<any>(null)
  const [showMeetupForm, setShowMeetupForm] = useState(false)
  const [showTripForm, setShowTripForm] = useState(false)
  const [showTimeAwayForm, setShowTimeAwayForm] = useState(false)

  // Get current user's RSVP for an event
  const getCurrentUserRsvp = (eventData: any, eventType: 'meetup' | 'trip') => {
    if (!currentUser || !eventData.rsvps) return null

    const userRsvp = eventData.rsvps.find((rsvp: any) => rsvp.member_id === currentUser.id)
    return userRsvp ? { status: userRsvp.status } : null
  }

  // Filter and sort data for dashboard (only upcoming events, soonest first)
  const meetups = useMemo(() =>
    allMeetups
      .filter(meetup => new Date(meetup.date_time) >= new Date())
      .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()),
    [allMeetups]
  )

  const trips = useMemo(() =>
    allTrips
      .filter(trip => new Date(trip.start_date) >= new Date())
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()),
    [allTrips]
  )

  const timeAway = useMemo(() =>
    allTimeAway
      .filter(ta => new Date(ta.start_date) >= new Date())
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()),
    [allTimeAway]
  )

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (setupRequired) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Setup Required</h2>
          <p className="text-gray-600 mb-6">
            Please run the SQL setup in your Supabase dashboard to create the necessary tables.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
            <p className="font-mono text-xs">
              Database tables not found. Please run the SQL setup in Supabase.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <LayoutShell onFabClick={() => setShowMeetupForm(true)}>
      <div className="pb-4">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pal Cal(ender)</h1>
          <p className="text-gray-600 mt-1">Track meetups, trips, and time away</p>
        </header>

        {/* Meetups Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Meetups</h2>

          {meetups.length === 0 ? (
            <div className="card-revolut p-8 text-center">
              <Calendar className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-gray-600">No upcoming meetups</p>
              <p className="text-gray-500 text-sm mt-2">Create your first meetup!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetups.map((meetup) => (
                <PlanCard
                  key={meetup.id}
                  title={meetup.title}
                  date={new Date(meetup.date_time)}
                  endDate={undefined}
                  location={meetup.location}
                  attendees={meetup.rsvps?.filter((rsvp: any) => rsvp.status === 'going').map((rsvp: any) => {
                    const member = members.find(m => m.id === rsvp.member_id)
                    return {
                      id: rsvp.member_id,
                      name: member?.name || 'Unknown',
                      color: member?.color || '#F6A08B'
                    }
                  }) || []}
                  onEdit={() => setShowEditMeetup(meetup)}
                  onCardClick={() => window.location.href = `/meetups/${meetup.id}`}
                >
                  <RsvpButtons
                    currentRsvp={getCurrentUserRsvp(meetup, 'meetup')}
                    onRsvp={(status) => updateMeetupRsvp(meetup.id, status)}
                  />
                </PlanCard>
              ))}
            </div>
          )}
        </section>

        {/* Trips Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trips</h2>

          {trips.length === 0 ? (
            <div className="card-revolut p-8 text-center">
              <Plane className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-gray-600">No upcoming trips</p>
              <p className="text-gray-500 text-sm mt-2">Plan your next adventure!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <PlanCard
                  key={trip.id}
                  title={trip.title}
                  date={new Date(trip.start_date)}
                  endDate={new Date(trip.end_date)}
                  location={trip.location}
                  attendees={trip.rsvps?.filter((rsvp: any) => rsvp.status === 'going').map((rsvp: any) => {
                    const member = members.find(m => m.id === rsvp.member_id)
                    return {
                      id: rsvp.member_id,
                      name: member?.name || 'Unknown',
                      color: member?.color || '#F6A08B'
                    }
                  }) || []}
                  onEdit={() => setShowEditTrip(trip)}
                  onCardClick={() => window.location.href = `/trips/${trip.id}`}
                >
                  <RsvpButtons
                    currentRsvp={getCurrentUserRsvp(trip, 'trip')}
                    onRsvp={(status) => updateTripRsvp(trip.id, status)}
                  />
                </PlanCard>
              ))}
            </div>
          )}
        </section>

        {/* Time Away Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Away</h2>

          {timeAway.length === 0 ? (
            <div className="card-revolut p-8 text-center">
              <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-gray-600">No upcoming time away</p>
              <p className="text-gray-500 text-sm mt-2">Share when you'll be traveling!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeAway.map((timeAwayEntry) => (
                <div key={timeAwayEntry.id} className="card-revolut p-4">
                  <p className="font-semibold text-gray-900">
                    {timeAwayEntry.members?.name || 'Unknown'}
                  </p>
                  <p className="text-gray-600">
                    {new Date(timeAwayEntry.start_date).toLocaleDateString()} - {new Date(timeAwayEntry.end_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Meetup Modal */}
      <Sheet open={showMeetupForm} onOpenChange={setShowMeetupForm}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="p-6 pb-0">
            <SheetHeader>
              <SheetTitle>Create Meetup</SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <MeetupForm
              onSubmit={async (data) => {
                await createMeetup(data)
                setShowMeetupForm(false)
              }}
              onCancel={() => setShowMeetupForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Trip Modal */}
      <Sheet open={showTripForm} onOpenChange={setShowTripForm}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="p-6 pb-0">
            <SheetHeader>
              <SheetTitle>Create Trip</SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <TripForm
              onSubmit={async (data) => {
                await createTrip(data)
                setShowTripForm(false)
              }}
              onCancel={() => setShowTripForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Time Away Modal */}
      <Sheet open={showTimeAwayForm} onOpenChange={setShowTimeAwayForm}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="p-6 pb-0">
            <SheetHeader>
              <SheetTitle>Add Time Away</SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <TimeAwayForm
              onSubmit={async (data) => {
                await createTimeAway(data)
                setShowTimeAwayForm(false)
              }}
              onCancel={() => setShowTimeAwayForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Meetup Modal */}
      <Sheet open={!!showEditMeetup} onOpenChange={() => setShowEditMeetup(null)}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="p-6 pb-0">
            <SheetHeader>
              <SheetTitle>Edit Meetup</SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {showEditMeetup && (
              <MeetupForm
                initialData={{
                  title: showEditMeetup.title,
                  dateTime: showEditMeetup.date_time,
                  location: showEditMeetup.location || '',
                  notes: showEditMeetup.notes || ''
                }}
                onSubmit={async (data) => {
                  await updateMeetup(showEditMeetup.id, data)
                  setShowEditMeetup(null)
                }}
                onCancel={() => setShowEditMeetup(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Trip Modal */}
      <Sheet open={!!showEditTrip} onOpenChange={() => setShowEditTrip(null)}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="p-6 pb-0">
            <SheetHeader>
              <SheetTitle>Edit Trip</SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {showEditTrip && (
              <TripForm
                initialData={{
                  title: showEditTrip.title,
                  startDate: showEditTrip.start_date,
                  endDate: showEditTrip.end_date,
                  location: showEditTrip.location || '',
                  notes: showEditTrip.notes || ''
                }}
                onSubmit={async (data) => {
                  await updateTrip(showEditTrip.id, data)
                  setShowEditTrip(null)
                }}
                onCancel={() => setShowEditTrip(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </LayoutShell>
  )
}
