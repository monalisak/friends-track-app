"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, Clock, Plus } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/utils/supabase"
import { MeetupForm } from "@/components/forms/meetup-form"
import { TripForm } from "@/components/forms/trip-form"
import { TimeAwayForm } from "@/components/forms/time-away-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatDateTime } from "@/lib/date-utils"

export function DashboardContent() {
  const { currentUser } = useUser()
  const [nextMeetup, setNextMeetup] = useState<any>(null)
  const [upcomingMeetups, setUpcomingMeetups] = useState<any[]>([])
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([])
  const [awaySoon, setAwaySoon] = useState<any[]>([])
  const [setupRequired, setSetupRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMeetupForm, setShowMeetupForm] = useState(false)
  const [showTripForm, setShowTripForm] = useState(false)
  const [showTimeAwayForm, setShowTimeAwayForm] = useState(false)

  const fetchDashboardData = async () => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setSetupRequired(true)
      setLoading(false)
      return
    }

    try {
      // Fetch dashboard data
      const [
        { data: nextMeetupData, error: nextMeetupError },
        { data: upcomingMeetupsData },
        { data: upcomingTripsData },
        { data: awaySoonData }
      ] = await Promise.all([
        // Next upcoming meetup
        supabase
          .from('meetups')
          .select(`
            *,
            rsvps(*)
          `)
          .gte('date_time', new Date().toISOString())
          .order('date_time', { ascending: true })
          .limit(1)
          .single(),

        // Next 5 upcoming meetups
        supabase
          .from('meetups')
          .select(`
            *,
            rsvps(*)
          `)
          .gte('date_time', new Date().toISOString())
          .order('date_time', { ascending: true })
          .limit(5),

        // Next 3 upcoming trips
        supabase
          .from('trips')
          .select(`
            *,
            rsvps(*)
          `)
          .gte('end_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(3),

        // Who's away in next 30 days
        supabase
          .from('time_away')
          .select(`
            *,
            members(*)
          `)
          .gte('end_date', new Date().toISOString().split('T')[0])
          .lte('start_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('start_date', { ascending: true })
      ])

      setNextMeetup(nextMeetupError ? null : nextMeetupData)
      setUpcomingMeetups(upcomingMeetupsData || [])
      setUpcomingTrips(upcomingTripsData || [])
      setAwaySoon(awaySoonData || [])
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

    try {
      const { error } = await supabase
        .from('time_away')
        .insert({
          member_id: currentUser.id,
          start_date: data.startDate,
          end_date: data.endDate,
          type: data.type || null,
          notes: data.notes || null,
          created_by: currentUser.id,
        })

      if (error) {
        console.error('Error creating time away:', error)
      } else {
        setShowTimeAwayForm(false)
        fetchDashboardData() // Refresh dashboard
      }
    } catch (error) {
      console.error('Error creating time away:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">Friend Track</h1>
        <p className="text-gray-600 mt-1">
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
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Create Meetup</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <MeetupForm
              onSubmit={handleCreateMeetup}
              onCancel={() => setShowMeetupForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Trip Form Sheet */}
      <Sheet open={showTripForm} onOpenChange={setShowTripForm}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Create Trip</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <TripForm
              onSubmit={handleCreateTrip}
              onCancel={() => setShowTripForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Time Away Form Sheet */}
      <Sheet open={showTimeAwayForm} onOpenChange={setShowTimeAwayForm}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Add Time Away</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <TimeAwayForm
              onSubmit={handleCreateTimeAway}
              onCancel={() => setShowTimeAwayForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Next Meetup Card */}
      {nextMeetup && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Next Meetup</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{nextMeetup.title}</h3>
                <div className="flex items-center text-gray-600 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {formatDateTime(nextMeetup.date_time)}
                  </span>
                </div>
                {nextMeetup.location && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{nextMeetup.location}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm text-blue-600">
                <Users className="w-4 h-4 mr-1" />
                <span>{nextMeetup.rsvps?.length || 0} going</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Meetups */}
      {upcomingMeetups.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Meetups</h2>
          <div className="space-y-3">
            {upcomingMeetups.map((meetup: any) => (
              <div key={meetup.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="font-medium text-gray-900">{meetup.title}</h3>
                <p className="text-sm text-gray-600">
                  {formatDateTime(meetup.date_time)}
                </p>
                {meetup.location && (
                  <p className="text-sm text-gray-600">{meetup.location}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Trips */}
      {upcomingTrips.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Trips</h2>
          <div className="space-y-3">
            {upcomingTrips.map((trip: any) => (
              <div key={trip.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="font-medium text-gray-900">{trip.title}</h3>
                {trip.location && <p className="text-sm text-gray-600">{trip.location}</p>}
                <p className="text-sm text-gray-600">
                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Who's Away */}
      {awaySoon.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Who's Away Soon</h2>
          <div className="space-y-3">
            {awaySoon.map((timeAway: any) => (
              <div key={timeAway.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{timeAway.members?.name || 'Unknown'}</p>
                    {timeAway.type && <p className="text-sm text-gray-600">{timeAway.type}</p>}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {new Date(timeAway.start_date).toLocaleDateString()} - {new Date(timeAway.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Setup Required State */}
      {setupRequired && (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Database Setup Required</h3>
          <p className="text-gray-600 mb-4">
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

      {/* Empty State */}
      {!setupRequired && !nextMeetup && upcomingMeetups.length === 0 && upcomingTrips.length === 0 && awaySoon.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Friend Track!</h3>
          <p className="text-gray-600">No upcoming events yet. Start by adding a meetup or trip.</p>
        </div>
      )}
    </div>
  )
}
