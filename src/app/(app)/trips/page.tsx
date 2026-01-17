"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plane, Plus, Users, Trash2, Pencil } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useData } from "@/contexts/data-context"
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
  }>
}

export default function TripsPage() {
  const router = useRouter()
  const { currentUser, members } = useUser()
  const { trips: allTrips, loading, createTrip, updateTripRsvp, deleteTrip, updateTrip } = useData()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditTrip, setShowEditTrip] = useState<Trip | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Trips list (chronological)
  const trips = useMemo(
    () =>
      [...(allTrips as any as Trip[])].sort(
        (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      ),
    [allTrips]
  )


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

  const getMemberColor = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member?.color || '#6b7280'
  }

  const handleCreateTrip = async (data: any) => {
    await createTrip(data)
    setShowCreateForm(false)
  }

  const handleDeleteTrip = async (tripId: string) => {
    await deleteTrip(tripId)
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
      <header className="mb-8">
        <div className="card-revolut p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-primary">Group Trips</h1>
              <p className="text-secondary mt-1">Plan and organize trips together</p>
            </div>
            <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
              <SheetTrigger asChild>
            <button className="bg-accent text-white p-3 rounded-full hover:bg-accent transition-colors opacity-80 hover:opacity-100">
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
        </div>
        </div>
      </header>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No upcoming trips
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create a new trip to get started!
            </p>
          </div>
        ) : (
          trips.map((trip) => {
            const userRsvp = getUserRsvp(trip)
            const rsvpCounts = getRsvpCounts(trip)

            return (
              <div
                key={trip.id}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                onClick={() => router.push(`/trips/${trip.id}`)}
              >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{trip.title}</h3>
                    {trip.location && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{trip.location}</p>}
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </p>
            </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    !userRsvp
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                      : userRsvp.status === 'going'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : userRsvp.status === 'maybe'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {userRsvp ? userRsvp.status : 'Not responded'}
            </span>
          </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
              <Users className="w-4 h-4 mr-1" />
                    <span>
                      {rsvpCounts.going} going • {rsvpCounts.maybe} maybe • {rsvpCounts.cant} can't
            </span>
          </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Created by {getMemberName(trip.created_by)}
            </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowEditTrip(trip)
                      }}
                      className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                      title="Edit trip"
                    >
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirm(trip.id)
                      }}
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
                    onRsvp={(status) => updateTripRsvp(trip.id, status)}
                  />
                )}
            </div>
            )
          })
        )}
          </div>

      {/* Edit Trip Sheet */}
      <Sheet open={!!showEditTrip} onOpenChange={(open) => !open && setShowEditTrip(null)}>
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
                  notes: showEditTrip.notes || '',
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Trip?</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
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
