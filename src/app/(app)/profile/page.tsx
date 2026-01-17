"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/utils/supabase"
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/date-utils"

interface Event {
  id: string
  type: 'meetup' | 'trip' | 'timeaway'
  title: string
  date: Date
  location: string | null
  notes?: string
  rsvps?: any[]
}

export default function ProfilePage() {
  const { currentUser } = useUser()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      fetchUserEvents()
    }
  }, [currentUser])

  const fetchUserEvents = async () => {
    if (!currentUser) return

    try {
      // Fetch all events created by current user
      const [
        { data: meetupsData },
        { data: tripsData },
        { data: timeAwayData }
      ] = await Promise.all([
        // Meetups created by user
        supabase
          .from('meetups')
          .select(`
            *,
            rsvps(*)
          `)
          .eq('created_by', currentUser.id)
          .order('date_time', { ascending: false }),

        // Trips created by user
        supabase
          .from('trips')
          .select(`
            *,
            rsvps(*)
          `)
          .eq('created_by', currentUser.id)
          .order('start_date', { ascending: false }),

        // Time away created by user
        supabase
          .from('time_away')
          .select(`
            *,
            members(*)
          `)
          .eq('created_by', currentUser.id)
          .order('start_date', { ascending: false })
      ])

      // Combine and sort all events by date (newest first)
      const allEvents: Event[] = []

      // Add meetups
      meetupsData?.forEach(meetup => {
        allEvents.push({
          id: `meetup-${meetup.id}`,
          type: 'meetup',
          title: meetup.title,
          date: new Date(meetup.date_time),
          location: meetup.location,
          notes: meetup.notes,
          rsvps: meetup.rsvps
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
          rsvps: trip.rsvps
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
          rsvps: []
        })
      })

      // Sort by date (newest first)
      allEvents.sort((a, b) => b.date.getTime() - a.date.getTime())
      setEvents(allEvents)

    } catch (error) {
      console.error('Error fetching user events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    window.history.back()
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Please select a user first</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-medium"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentUser.name}'s Events
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Events you've created
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No events created yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Events you create will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {events.length} event{events.length !== 1 ? 's' : ''} created
            </div>

            {events.map((event) => {
              const dayName = event.date.toLocaleDateString('en-US', { weekday: 'short' })
              const monthDay = event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

              return (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (event.type === 'meetup') {
                      window.location.href = `/meetups/${event.id.split('-')[1]}`
                    } else if (event.type === 'trip') {
                      window.location.href = `/trips/${event.id.split('-')[1]}`
                    }
                  }}
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{dayName}</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{monthDay}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.type === 'meetup' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        event.type === 'trip' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {event.type === 'meetup' ? 'Meetup' :
                         event.type === 'trip' ? 'Trip' : 'Time Away'}
                      </div>
                    </div>

                    {event.type !== 'timeaway' && event.rsvps && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{event.rsvps.filter((rsvp: any) => rsvp.status === 'going').length} going</span>
                      </div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2">
                      {event.title}
                    </h3>

                    {event.location && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.notes && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                        {event.notes}
                      </p>
                    )}

                    {/* Time for meetups */}
                    {event.type === 'meetup' && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mt-2">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{event.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
