"use client"

import { useMemo, useState } from "react"
import { useUser } from "@/contexts/user-context"
import { useData } from "@/contexts/data-context"
import { Calendar, Clock, Plane } from "lucide-react"
import { PlanCard } from "@/components/plan-card"
import { MEMBERS } from "@/lib/members"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MeetupForm } from "@/components/forms/meetup-form"
import { TripForm } from "@/components/forms/trip-form"
import { formatDateTime } from "@/lib/date-utils"

export default function ProfilePage() {
  const { currentUser } = useUser()
  const { meetups, trips, timeAway, loading, updateMeetup, updateTrip } = useData()
  const [showEditMeetup, setShowEditMeetup] = useState<any>(null)
  const [showEditTrip, setShowEditTrip] = useState<any>(null)

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="text-center py-12">
          <p className="text-gray-600">Please select a user first</p>
        </div>
      </div>
    )
  }

  const todayISO = new Date().toISOString().split("T")[0]

  const meetupsCreated = useMemo(() => {
    const list = (meetups as any[]).filter((m) => m.created_by === currentUser.id)
    const upcoming = list
      .filter((m) => new Date(m.date_time) >= new Date())
      .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
    const past = list
      .filter((m) => new Date(m.date_time) < new Date())
      .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
    return { upcoming, past }
  }, [meetups, currentUser.id])

  const getMemberMeta = (id: string) => MEMBERS.find((m) => m.id === id)

  const tripsCreated = useMemo(() => {
    const list = (trips as any[]).filter((t) => t.created_by === currentUser.id)
    const upcoming = list
      .filter((t) => t.end_date >= todayISO)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    const past = list
      .filter((t) => t.end_date < todayISO)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    return { upcoming, past }
  }, [trips, currentUser.id, todayISO])

  const timeAwayCreated = useMemo(() => {
    const list = (timeAway as any[]).filter((ta) => ta.created_by === currentUser.id)
    const upcoming = list
      .filter((ta) => ta.end_date >= todayISO)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    const past = list
      .filter((ta) => ta.end_date < todayISO)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    return { upcoming, past }
  }, [timeAway, currentUser.id, todayISO])

  const totalCount =
    meetupsCreated.upcoming.length +
    meetupsCreated.past.length +
    tripsCreated.upcoming.length +
    tripsCreated.past.length +
    timeAwayCreated.upcoming.length +
    timeAwayCreated.past.length

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-32">
      <header className="mb-6">
        <div className="card-revolut p-6">
          <h1 className="text-xl font-semibold text-gray-900">Your Created Events</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} item{totalCount !== 1 ? "s" : ""} created by you
          </p>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading…</p>
        </div>
      ) : totalCount === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events created yet</h3>
          <p className="text-gray-600">Events you create will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Meetups */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Meetups</h2>
            {meetupsCreated.upcoming.length === 0 && meetupsCreated.past.length === 0 ? (
              <div className="card-revolut p-5 text-gray-600">No meetups created.</div>
            ) : (
              <div className="space-y-3">
                {meetupsCreated.upcoming.map((m) => (
                  <PlanCard
                    key={m.id}
                    title={m.title}
                    date={new Date(m.date_time)}
                    dateLine={formatDateTime(m.date_time)}
                    location={m.location}
                    attendees={(m.rsvps || [])
                      .filter((r: any) => r.status === "going")
                      .map((r: any) => {
                        const meta = getMemberMeta(r.member_id)
                        return {
                          id: r.member_id,
                          name: meta?.name || "Unknown",
                          color: meta?.color || currentUser.color,
                        }
                      })}
                    onEdit={() => setShowEditMeetup(m)}
                    onCardClick={() => (window.location.href = `/meetups/${m.id}`)}
                  />
                ))}

                {meetupsCreated.past.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Past</p>
                    <div className="space-y-3">
                      {meetupsCreated.past.map((m) => (
                        <PlanCard
                          key={m.id}
                          title={m.title}
                          date={new Date(m.date_time)}
                          dateLine={formatDateTime(m.date_time)}
                          location={m.location}
                          attendees={(m.rsvps || [])
                            .filter((r: any) => r.status === "going")
                            .map((r: any) => {
                              const meta = getMemberMeta(r.member_id)
                              return {
                                id: r.member_id,
                                name: meta?.name || "Unknown",
                                color: meta?.color || currentUser.color,
                              }
                            })}
                          onEdit={() => setShowEditMeetup(m)}
                          onCardClick={() => (window.location.href = `/meetups/${m.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Trips */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trips</h2>
            {tripsCreated.upcoming.length === 0 && tripsCreated.past.length === 0 ? (
              <div className="card-revolut p-5 text-gray-600">No trips created.</div>
            ) : (
              <div className="space-y-3">
                {tripsCreated.upcoming.map((t) => (
                  <PlanCard
                    key={t.id}
                    title={t.title}
                    date={new Date(t.start_date)}
                    endDate={new Date(t.end_date)}
                    location={t.location}
                    attendees={(t.rsvps || [])
                      .filter((r: any) => r.status === "going")
                      .map((r: any) => {
                        const meta = getMemberMeta(r.member_id)
                        return {
                          id: r.member_id,
                          name: meta?.name || "Unknown",
                          color: meta?.color || currentUser.color,
                        }
                      })}
                    onEdit={() => setShowEditTrip(t)}
                    onCardClick={() => (window.location.href = `/trips/${t.id}`)}
                  />
                ))}

                {tripsCreated.past.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Past</p>
                    <div className="space-y-3">
                      {tripsCreated.past.map((t) => (
                        <PlanCard
                          key={t.id}
                          title={t.title}
                          date={new Date(t.start_date)}
                          endDate={new Date(t.end_date)}
                          location={t.location}
                          attendees={(t.rsvps || [])
                            .filter((r: any) => r.status === "going")
                            .map((r: any) => {
                              const meta = getMemberMeta(r.member_id)
                              return {
                                id: r.member_id,
                                name: meta?.name || "Unknown",
                                color: meta?.color || currentUser.color,
                              }
                            })}
                          onEdit={() => setShowEditTrip(t)}
                          onCardClick={() => (window.location.href = `/trips/${t.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Time Away */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Away</h2>
            {timeAwayCreated.upcoming.length === 0 && timeAwayCreated.past.length === 0 ? (
              <div className="card-revolut p-5 text-gray-600">No time away created.</div>
            ) : (
              <div className="space-y-3">
                {[...timeAwayCreated.upcoming, ...timeAwayCreated.past].map((ta) => (
                  <div key={ta.id} className="card-revolut p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {ta.members?.name || currentUser.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {(ta.notes || ta.type || "—") as string}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 text-sm text-gray-600">
                        {new Date(ta.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" – "}
                        {new Date(ta.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Edit sheets */}
      <Sheet open={!!showEditMeetup} onOpenChange={(open) => !open && setShowEditMeetup(null)}>
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
                  location: showEditMeetup.location || "",
                  notes: showEditMeetup.notes || "",
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
                  location: showEditTrip.location || "",
                  notes: showEditTrip.notes || "",
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
    </div>
  )
}
