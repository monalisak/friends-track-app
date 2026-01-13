"use client"

import { useState, useEffect } from "react"
import { Plane, Plus, Users, Trash2 } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/utils/supabase"
import { TripForm } from "@/components/forms/trip-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { RsvpButtons } from "@/components/rsvp/rsvp-buttons"

interface Trip {
  id: string
  title: string
  start_date: string
  end_date: string
  location?: string
  notes?: string
  created_by: string
  rsvps: Array<{
    id: string
    member_id: string
    status: 'going' | 'maybe' | 'cant'
    comment?: string
  }>
}

export default function TripsPage() {
  const { currentUser, members } = useUser()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchTrips()

    // Set up real-time subscriptions
    const tripsSubscription = supabase
      .channel('trips_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
        fetchTrips()
      })
      .subscribe()

    const rsvpsSubscription = supabase
      .channel('trips_rsvps_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, () => {
        fetchTrips()
      })
      .subscribe()

    return () => {
      tripsSubscription.unsubscribe()
      rsvpsSubscription.unsubscribe()
    }
  }, [])

  const fetchTrips = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          rsvps(*)
        `)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true })

      if (error) {
        console.error('Error fetching trips:', error)
      } else {
        setTrips(data || [])
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserRsvp = (trip: Trip) => {
    if (!currentUser) return null
    return trip.rsvps.find(rsvp => rsvp.member_id === currentUser.id)
  }

  const getRsvpCounts = (trip: Trip) => {
    const counts = { going: 0, maybe: 0, cant: 0 }
    trip.rsvps.forEach(rsvp => {
      counts[rsvp.status]++
    })
    return counts
  }

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member?.name || 'Unknown'
  }

  const handleRsvpUpdate = async (tripId: string, status: 'going' | 'maybe' | 'cant', comment?: string) => {
    if (!currentUser) return

    try {
      const { error } = await supabase
        .from('rsvps')
        .upsert({
          trip_id: tripId,
          member_id: currentUser.id,
          status,
          comment: comment || null,
        })

      if (error) {
        console.error('Error updating RSVP:', error)
      }
    } catch (error) {
      console.error('Error updating RSVP:', error)
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
        setShowCreateForm(false)
        fetchTrips()
      }
    } catch (error) {
      console.error('Error creating trip:', error)
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)

      if (error) {
        console.error('Error deleting trip:', error)
      } else {
        setDeleteConfirm(null)
        fetchTrips()
      }
    } catch (error) {
      console.error('Error deleting trip:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">Group Trips</h1>
          <p className="text-gray-600 mt-1">Plan and organize trips together</p>
        </div>
        <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
          <SheetTrigger asChild>
            <button className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] p-0">
            <div className="p-6 pb-0">
              <SheetHeader>
                <SheetTitle>Create Trip</SheetTitle>
              </SheetHeader>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <TripForm
                onSubmit={handleCreateTrip}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No upcoming trips
            </h3>
            <p className="text-gray-600">
              Create a new trip to get started!
            </p>
          </div>
        ) : (
          trips.map((trip) => {
            const userRsvp = getUserRsvp(trip)
            const rsvpCounts = getRsvpCounts(trip)

            return (
              <div key={trip.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{trip.title}</h3>
                    {trip.location && <p className="text-sm text-gray-600 mt-1">{trip.location}</p>}
                    <p className="text-sm text-gray-600">
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </p>
                  </div>
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    <span>
                      {rsvpCounts.going} going • {rsvpCounts.maybe} maybe • {rsvpCounts.cant} can't
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      Created by {getMemberName(trip.created_by)}
                    </div>
                    <button
                      onClick={() => setDeleteConfirm(trip.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                      title="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {currentUser && (
                  <RsvpButtons
                    currentRsvp={userRsvp}
                    onRsvp={(status, comment) => handleRsvpUpdate(trip.id, status, comment)}
                  />
                )}

                {/* Display RSVP Comments */}
                {trip.rsvps && trip.rsvps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="space-y-2">
                      {trip.rsvps
                        .filter(rsvp => rsvp.comment && rsvp.comment.trim())
                        .map(rsvp => (
                          <div key={rsvp.id} className="flex items-start space-x-2 text-sm">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-0.5"
                              style={{ backgroundColor: getMemberColor(rsvp.member_id) }}
                            >
                              {getMemberName(rsvp.member_id).charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {getMemberName(rsvp.member_id)}
                                </span>
                                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                                  rsvp.status === 'going' ? 'bg-green-100 text-green-700' :
                                  rsvp.status === 'maybe' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {rsvp.status}
                                </span>
                              </div>
                              <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                {rsvp.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Trip?</h3>
            <p className="text-gray-600 text-sm mb-6">
              This will permanently delete this trip and all RSVPs. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTrip(deleteConfirm)}
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
