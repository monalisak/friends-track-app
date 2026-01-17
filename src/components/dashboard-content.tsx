"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, Clock, Plus, Plane } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/utils/supabase"
import { MeetupForm } from "@/components/forms/meetup-form"
import { TripForm } from "@/components/forms/trip-form"
import { TimeAwayForm } from "@/components/forms/time-away-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { RsvpButtons } from "@/components/rsvp/rsvp-buttons"
import { formatDateTime } from "@/lib/date-utils"

export function DashboardContent() {
  const { currentUser } = useUser()
  const [meetups, setMeetups] = useState<any[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [timeAway, setTimeAway] = useState<any[]>([])
  const [setupRequired, setSetupRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMeetupForm, setShowMeetupForm] = useState(false)
  const [showTripForm, setShowTripForm] = useState(false)
  const [showTimeAwayForm, setShowTimeAwayForm] = useState(false)

  // RSVP handling functions
  const handleMeetupRsvp = async (meetupId: string, status: 'going' | 'maybe' | 'cant' | null) => {
    if (!currentUser) return

    try {
      let error = null

      if (status === null) {
        // Clear RSVP
        const result = await supabase
          .from('rsvps')
          .delete()
          .eq('meetup_id', meetupId)
          .eq('member_id', currentUser.id)
        error = result.error
      } else {
        // Update RSVP
        const result = await supabase
          .from('rsvps')
          .upsert({
            meetup_id: meetupId,
            member_id: currentUser.id,
            status,
          })
        error = result.error
      }

      if (error) {
        console.error('Error updating meetup RSVP:', error)
      } else {
        // Refresh data
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error updating meetup RSVP:', error)
    }
  }

  const handleTripRsvp = async (tripId: string, status: 'going' | 'maybe' | 'cant' | null) => {
    if (!currentUser) return

    try {
      let error = null

      if (status === null) {
        // Clear RSVP
        const result = await supabase
          .from('rsvps')
          .delete()
          .eq('trip_id', tripId)
          .eq('member_id', currentUser.id)
        error = result.error
      } else {
        // Update RSVP
        const result = await supabase
          .from('rsvps')
          .upsert({
            trip_id: tripId,
            member_id: currentUser.id,
            status,
          })
        error = result.error
      }

      if (error) {
        console.error('Error updating trip RSVP:', error)
      } else {
        // Refresh data
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error updating trip RSVP:', error)
    }
  }

  // Get current user's RSVP for an event
  const getCurrentUserRsvp = (eventData: any, eventType: 'meetup' | 'trip') => {
    if (!currentUser || !eventData.rsvps) return null

    const userRsvp = eventData.rsvps.find((rsvp: any) => rsvp.member_id === currentUser.id)
    return userRsvp ? { status: userRsvp.status } : null
  }

  const fetchDashboardData = async () => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setSetupRequired(true)
      setLoading(false)
      return
    }

    try {
      // Fetch all upcoming events for unified calendar view
      const [
        { data: meetupsData },
        { data: tripsData },
        { data: timeAwayData }
      ] = await Promise.all([
        // All upcoming meetups
        supabase
          .from('meetups')
          .select(`
            *,
            rsvps(member_id, status)
          `)
          .gte('date_time', new Date().toISOString())
          .order('date_time', { ascending: true }),

        // All upcoming trips
        supabase
          .from('trips')
          .select(`
            *,
            rsvps(member_id, status)
          `)
          .gte('start_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true }),

        // All upcoming time away
        supabase
          .from('time_away')
          .select(`
            *,
            members!member_id(*)
          `)
          .gte('start_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true })
      ])

      // Combine and sort all events by date for calendar view
      const allEvents: any[] = []

      // Add meetups
      meetupsData?.forEach(meetup => {
        allEvents.push({
          id: `meetup-${meetup.id}`,
          type: 'meetup',
          title: meetup.title,
          date: new Date(meetup.date_time),
          location: meetup.location,
          notes: meetup.notes,
          data: meetup,
          created_by: meetup.created_by
        })
      })

      // Add trips
      tripsData?.forEach(trip => {
        allEvents.push({
          id: `trip-${trip.id}`,
          type: 'trip',
          title: trip.title,
          date: new Date(trip.start_date),
          location: trip.location,
          notes: trip.notes,
          data: trip,
          created_by: trip.created_by
        })
      })

      // Add time away
      timeAwayData?.forEach(timeAway => {
        allEvents.push({
          id: `timeaway-${timeAway.id}`,
          type: 'timeaway',
          title: `${timeAway.members?.name || 'Unknown'} - ${timeAway.type || 'Time Away'}`,
          date: new Date(timeAway.start_date),
          location: null,
          notes: timeAway.notes,
          data: timeAway,
          created_by: timeAway.created_by
        })
      })

      // Set separate arrays for each section
      setMeetups(meetupsData || [])
      setTrips(tripsData || [])
      setTimeAway(timeAwayData || [])
    } catch (error) {
      console.error('Dashboard error:', error)
      // Check if it's a table not found error
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        const err = error as { code?: string; message?: string }
        if (err.code === 'PGRST116' || err.message?.includes('relation') || err.message?.includes('does not exist')) {
          console.error('Database tables not found. Please run the SQL setup in Supabase.')
          setSetupRequired(true)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Set up real-time subscriptions for dashboard updates
    const meetupsSubscription = supabase
      .channel('dashboard_meetups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetups' }, () => {
        fetchDashboardData()
      })
      .subscribe()

    const rsvpsSubscription = supabase
      .channel('dashboard_rsvps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, () => {
        fetchDashboardData()
      })
      .subscribe()

    const tripsSubscription = supabase
      .channel('dashboard_trips')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
        fetchDashboardData()
      })
      .subscribe()

    const timeAwaySubscription = supabase
      .channel('dashboard_time_away')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_away' }, () => {
        fetchDashboardData()
      })
      .subscribe()

    return () => {
      meetupsSubscription.unsubscribe()
      rsvpsSubscription.unsubscribe()
      tripsSubscription.unsubscribe()
      timeAwaySubscription.unsubscribe()
    }
  }, [])

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
        setShowMeetupForm(false)
        fetchDashboardData() // Refresh dashboard
      }
    } catch (error) {
      console.error('Error creating meetup:', error)
    }
  }

  const handleCreateTrip = async (data: any) => {
    if (!currentUser) return

    try {
      const { error } = await supabase
        .from('trips')
        .insert({
          title: data.title,
          start_date: data.startDate,
          end_date: data.endDate,
          location: data.location || null,
          notes: data.notes || null,
          created_by: currentUser.id,
        })

      if (error) {
        console.error('Error creating trip:', error)
      } else {
        setShowTripForm(false)
        fetchDashboardData() // Refresh dashboard
      }
    } catch (error) {
      console.error('Error creating trip:', error)
    }
  }

  const handleCreateTimeAway = async (data: any) => {
    if (!currentUser) return

    console.log('Dashboard: Creating time away with data:', data)
    console.log('Dashboard: Current user:', currentUser)

    try {
      const insertData = {
        member_id: currentUser.id,
        start_date: data.startDate,
        end_date: data.endDate,
        type: data.type || null,
        notes: data.notes || null,
        created_by: currentUser.id,
      }

      console.log('Dashboard: Inserting data:', insertData)

      const { data: result, error } = await supabase
        .from('time_away')
        .insert(insertData)
        .select()

      if (error) {
        console.error('Dashboard: Error creating time away:', error)
        console.error('Dashboard: Error details:', error.message, error.details, error.hint)
      } else {
        console.log('Dashboard: Time away created successfully:', result)
        setShowTimeAwayForm(false)
        fetchDashboardData() // Refresh dashboard
      }
    } catch (error) {
      console.error('Dashboard: Exception creating time away:', error)
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
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mona's Friends Tracker</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {currentUser ? `Hi ${currentUser.name}!` : 'Track meetups, trips, and time away'}
        </p>
      </header>


      {/* Quick Actions */}
      <section className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setShowMeetupForm(true)}
            className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Add Meetup</span>
          </button>
          <button
            onClick={() => setShowTripForm(true)}
            className="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors"
          >
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Add Trip</span>
          </button>
          <button
            onClick={() => setShowTimeAwayForm(true)}
            className="bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Time Away</span>
          </button>
        </div>
      </section>

      {/* Meetup Form Sheet */}
      <Sheet open={showMeetupForm} onOpenChange={setShowMeetupForm}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="p-6 pb-0">
            <SheetHeader>
              <SheetTitle>Create Meetup</SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <MeetupForm
              onSubmit={handleCreateMeetup}
              onCancel={() => setShowMeetupForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Trip Form Sheet */}
      <Sheet open={showTripForm} onOpenChange={setShowTripForm}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="p-6 pb-0">
            <SheetHeader>
              <SheetTitle>Create Trip</SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <TripForm
              onSubmit={handleCreateTrip}
              onCancel={() => setShowTripForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Time Away Form Sheet */}
      <Sheet open={showTimeAwayForm} onOpenChange={setShowTimeAwayForm}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="p-6 pb-0">
            <SheetHeader>
              <SheetTitle>Add Time Away</SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <TimeAwayForm
              onSubmit={handleCreateTimeAway}
              onCancel={() => setShowTimeAwayForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>



      {/* Meetups Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meetups</h2>

        {meetups.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300">No upcoming meetups</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group meetups by date */}
            {(() => {
              const meetupsByDate = meetups.reduce((groups: Record<string, any[]>, meetup) => {
                const date = new Date(meetup.date_time).toDateString()
                if (!groups[date]) {
                  groups[date] = []
                }
                groups[date].push(meetup)
                return groups
              }, {} as Record<string, any[]>)

              return Object.entries(meetupsByDate).map(([dateString, dateMeetups]) => {
                const date = new Date(dateString)
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
                const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

                return (
                  <div key={dateString}>
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                      {dayName}, {monthDay}
                    </h3>
                    <div className="space-y-3">
                      {dateMeetups.map((meetup: any) => (
                        <div
                          key={meetup.id}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => window.location.href = `/meetups/${meetup.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                {meetup.title}
                              </h4>
                              <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-2">
                                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>{new Date(meetup.date_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                              </div>
                              {meetup.location && (
                                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-2">
                                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span>{meetup.location}</span>
                                </div>
                              )}
                              {meetup.notes && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                                  {meetup.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 ml-4">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{meetup.rsvps?.filter((rsvp: any) => rsvp.status === 'going').length || 0} going</span>
                            </div>
                          </div>

                          {/* RSVP Buttons */}
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <RsvpButtons
                              currentRsvp={getCurrentUserRsvp(meetup, 'meetup')}
                              onRsvp={(status) => handleMeetupRsvp(meetup.id, status)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        )}
      </section>

      {/* Trips Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trips</h2>

        {trips.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300">No upcoming trips</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip: any) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => window.location.href = `/trips/${trip.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {trip.title}
                    </h4>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-2">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</span>
                    </div>
                    {trip.location && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{trip.location}</span>
                      </div>
                    )}
                    {trip.notes && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                        {trip.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 ml-4">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{trip.rsvps?.filter((rsvp: any) => rsvp.status === 'going').length || 0} going</span>
                  </div>
                </div>

                {/* RSVP Buttons */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <RsvpButtons
                    currentRsvp={getCurrentUserRsvp(trip, 'trip')}
                    onRsvp={(status) => handleTripRsvp(trip.id, status)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Time Away Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Away</h2>

        {timeAway.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300">No upcoming time away</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timeAway.map((timeAwayEntry: any) => (
              <div
                key={timeAwayEntry.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {timeAwayEntry.members?.name || 'Unknown'}
                    </p>
                    {timeAwayEntry.type && <p className="text-sm text-gray-600 dark:text-gray-300">{timeAwayEntry.type}</p>}
                    {timeAwayEntry.notes && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{timeAwayEntry.notes}</p>}
                  </div>
                  <div className="text-right text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        {new Date(timeAwayEntry.start_date).toLocaleDateString()} - {new Date(timeAwayEntry.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Setup Required State */}
      {setupRequired && (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Database Setup Required</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You need to run the database setup in your Supabase project.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-left text-sm">
            <p className="font-medium mb-2">Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Go to your Supabase dashboard</li>
              <li>Open the SQL Editor</li>
              <li>Run the contents of <code className="bg-gray-200 px-1 rounded">supabase-setup.sql</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      )}

    </div>
  )
}
