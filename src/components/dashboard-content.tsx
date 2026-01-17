"use client"

import { useState, useEffect } from "react"
import { Users, Calendar } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/utils/supabase"
import { MeetupForm } from "@/components/forms/meetup-form"
import { TripForm } from "@/components/forms/trip-form"
import { TimeAwayForm } from "@/components/forms/time-away-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { PlanCard } from "@/components/plan-card"
import { LayoutShell } from "@/components/layout-shell"

export function DashboardContent() {
  const { currentUser } = useUser()
  const [plans, setPlans] = useState<any[]>([])
  const [setupRequired, setSetupRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMeetupForm, setShowMeetupForm] = useState(false)
  const [showTripForm, setShowTripForm] = useState(false)
  const [showTimeAwayForm, setShowTimeAwayForm] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

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

      // Combine all events into plan cards format
      const allPlans: any[] = []

      // Add meetups
      meetupsData?.forEach(meetup => {
        allPlans.push({
          id: `meetup-${meetup.id}`,
          type: 'meetup',
          title: meetup.title,
          date: new Date(meetup.date_time),
          location: meetup.location,
          data: meetup,
          attendees: meetup.rsvps?.map((rsvp: any) => ({
            id: rsvp.member_id,
            name: 'Attendee',
            color: '#F6A08B'
          })) || []
        })
      })

      // Add trips
      tripsData?.forEach(trip => {
        allPlans.push({
          id: `trip-${trip.id}`,
          type: 'trip',
          title: trip.title,
          date: new Date(trip.start_date),
          endDate: new Date(trip.end_date),
          location: trip.location,
          data: trip,
          attendees: trip.rsvps?.map((rsvp: any) => ({
            id: rsvp.member_id,
            name: 'Attendee',
            color: '#F6A08B'
          })) || []
        })
      })

      // Sort plans by date
      allPlans.sort((a, b) => a.date.getTime() - b.date.getTime())

      // If no real data, add sample plans for demo
      if (allPlans.length === 0) {
        const samplePlans = [
          {
            id: 'sample-1',
            type: 'meetup',
            title: 'Coffee Meetup',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            location: 'Starbucks Downtown',
            attendees: [
              { id: '1', name: 'Alice', color: '#F6A08B' },
              { id: '2', name: 'Bob', color: '#A8DADC' },
              { id: '3', name: 'Charlie', color: '#F4A261' }
            ]
          },
          {
            id: 'sample-2',
            type: 'trip',
            title: 'Beach Weekend',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
            location: 'Malibu Beach',
            attendees: [
              { id: '1', name: 'Alice', color: '#F6A08B' },
              { id: '2', name: 'Bob', color: '#A8DADC' }
            ]
          },
          {
            id: 'sample-3',
            type: 'meetup',
            title: 'Dinner Party',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            location: 'Mario\'s Italian Kitchen',
            attendees: [
              { id: '1', name: 'Alice', color: '#F6A08B' },
              { id: '2', name: 'Bob', color: '#A8DADC' },
              { id: '3', name: 'Charlie', color: '#F4A261' },
              { id: '4', name: 'Diana', color: '#E76F51' }
            ]
          }
        ]
        setPlans(samplePlans)
      } else {
        setPlans(allPlans)
      }
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
      <LayoutShell activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F04A23]"></div>
        </div>
      </LayoutShell>
    )
  }

  if (setupRequired) {
    return (
      <LayoutShell activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-[#F04A23]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#F04A23]" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Database Setup Required</h3>
          <p className="text-gray-600 mb-4">
            You need to run the database setup in your Supabase project.
          </p>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-left text-sm">
            <p className="font-medium mb-2">Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Go to your Supabase dashboard</li>
              <li>Open the SQL Editor</li>
              <li>Run the contents of <code className="bg-gray-200 px-1 rounded">supabase-setup.sql</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </LayoutShell>
    )
  }

  return (
    <LayoutShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onFabClick={() => setShowMeetupForm(true)}
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pal Cal(ender)</h1>
        <p className="text-gray-600">
          {currentUser ? `Welcome back, ${currentUser.name}!` : 'Track meetups, trips, and time away'}
        </p>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No upcoming plans
            </h3>
            <p className="text-gray-600">
              Create your first meetup or trip to get started!
            </p>
          </div>
        ) : (
          plans.map((plan: any) => (
            <PlanCard
              key={plan.id}
              title={plan.title}
              date={plan.date}
              endDate={plan.endDate}
              location={plan.location}
              attendees={plan.attendees}
              onCardClick={() => {
                if (plan.type === 'meetup') {
                  window.location.href = `/meetups/${plan.data.id}`
                } else if (plan.type === 'trip') {
                  window.location.href = `/trips/${plan.data.id}`
                }
              }}
              onEdit={() => {
                if (plan.type === 'meetup') {
                  window.location.href = `/meetups/${plan.data.id}`
                } else if (plan.type === 'trip') {
                  window.location.href = `/trips/${plan.data.id}`
                }
              }}
            />
          ))
        )}
      </div>
    </LayoutShell>
  )
}
