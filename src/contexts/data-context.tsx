"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase'
import { useUser } from './user-context'

export interface Meetup {
  id: string
  title: string
  date_time: string
  location?: string
  notes?: string
  created_by: string
  updated_by?: string
  rsvps: Array<{
    id: string
    member_id: string
    status: 'going' | 'maybe' | 'cant'
  }>
}

export interface Trip {
  id: string
  title: string
  start_date: string
  end_date: string
  location?: string
  notes?: string
  created_by: string
  updated_by?: string
  rsvps: Array<{
    id: string
    member_id: string
    status: 'going' | 'maybe' | 'cant'
  }>
}

export interface TimeAway {
  id: string
  member_id: string
  start_date: string
  end_date: string
  type?: string
  notes?: string
  created_by: string
  members?: {
    id: string
    name: string
    color: string
  }
}

interface DataContextType {
  // Data
  meetups: Meetup[]
  trips: Trip[]
  timeAway: TimeAway[]

  // Loading states
  loading: boolean
  setupRequired: boolean

  // Actions
  refreshData: () => Promise<void>
  createMeetup: (data: any) => Promise<void>
  updateMeetup: (id: string, data: any) => Promise<void>
  deleteMeetup: (id: string) => Promise<void>
  createTrip: (data: any) => Promise<void>
  updateTrip: (id: string, data: any) => Promise<void>
  deleteTrip: (id: string) => Promise<void>
  updateMeetupRsvp: (meetupId: string, status: 'going' | 'maybe' | 'cant' | null) => Promise<void>
  updateTripRsvp: (tripId: string, status: 'going' | 'maybe' | 'cant' | null) => Promise<void>
  createTimeAway: (data: any) => Promise<void>
  updateTimeAway: (id: string, data: any) => Promise<void>
  deleteTimeAway: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser()
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [timeAway, setTimeAway] = useState<TimeAway[]>([])
  const [loading, setLoading] = useState(true)
  const [setupRequired, setSetupRequired] = useState(false)

  // Fetch all data from Supabase
  const fetchData = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setSetupRequired(true)
      setLoading(false)
      return
    }

    try {
      console.log('Fetching all event data...')

      const [
        { data: meetupsData },
        { data: tripsData },
        { data: timeAwayData }
      ] = await Promise.all([
        // All meetups (past and future)
        supabase
          .from('meetups')
          .select(`
            *,
            rsvps(member_id, status)
          `)
          .order('date_time', { ascending: false }),

        // All trips (past and future)
        supabase
          .from('trips')
          .select(`
            *,
            rsvps(member_id, status)
          `)
          .order('start_date', { ascending: false }),

        // All time away
        supabase
          .from('time_away')
          .select(`
            *,
            members!member_id(*)
          `)
          .order('start_date', { ascending: false })
      ])

      console.log('Data fetched:', {
        meetups: meetupsData?.length || 0,
        trips: tripsData?.length || 0,
        timeAway: timeAwayData?.length || 0
      })

      setMeetups(meetupsData || [])
      setTrips(tripsData || [])
      setTimeAway(timeAwayData || [])
    } catch (error) {
      console.error('Data fetch error:', error)
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
  }, [])

  // Set up real-time subscriptions
  useEffect(() => {
    if (setupRequired) return

    console.log('Setting up real-time subscriptions...')

    const meetupsSubscription = supabase
      .channel('all_meetups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetups' }, (payload) => {
        console.log('Meetups change detected:', payload)
        fetchData()
      })
      .subscribe((status, err) => {
        console.log('Meetups subscription status:', status, err)
      })

    const tripsSubscription = supabase
      .channel('all_trips')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, (payload) => {
        console.log('Trips change detected:', payload)
        fetchData()
      })
      .subscribe((status, err) => {
        console.log('Trips subscription status:', status, err)
      })

    const timeAwaySubscription = supabase
      .channel('all_time_away')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_away' }, (payload) => {
        console.log('Time away change detected:', payload)
        fetchData()
      })
      .subscribe((status, err) => {
        console.log('Time away subscription status:', status, err)
      })

    const rsvpsSubscription = supabase
      .channel('all_rsvps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, (payload) => {
        console.log('RSVP change detected:', payload)
        fetchData()
      })
      .subscribe((status, err) => {
        console.log('RSVP subscription status:', status, err)
      })

    return () => {
      meetupsSubscription.unsubscribe()
      tripsSubscription.unsubscribe()
      timeAwaySubscription.unsubscribe()
      rsvpsSubscription.unsubscribe()
    }
  }, [fetchData, setupRequired])

  // Initial data load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Meetup CRUD operations
  const createMeetup = useCallback(async (data: any) => {
    if (!currentUser) throw new Error('No user logged in')

    const meetupData = {
      title: data.title,
      date_time: data.dateTime,
      location: data.location || null,
      notes: data.notes || null,
      created_by: currentUser.id
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticMeetup: Meetup = {
      id: tempId,
      ...meetupData,
      rsvps: []
    }
    setMeetups(prev => [optimisticMeetup, ...prev])

    try {
      const { data: result, error } = await supabase
        .from('meetups')
        .insert(meetupData)
        .select()
        .single()

      if (error) throw error

      // Replace optimistic update with real data
      setMeetups(prev => prev.map(m => m.id === tempId ? { ...result, rsvps: [] } : m))
    } catch (error) {
      // Remove optimistic update on error
      setMeetups(prev => prev.filter(m => m.id !== tempId))
      throw error
    }
  }, [currentUser])

  const updateMeetup = useCallback(async (id: string, data: any) => {
    if (!currentUser) throw new Error('No user logged in')

    // Optimistic update
    setMeetups(prev => prev.map(meetup =>
      meetup.id === id ? {
        ...meetup,
        title: data.title,
        date_time: data.dateTime,
        location: data.location || meetup.location,
        notes: data.notes || meetup.notes,
        updated_by: currentUser.id
      } : meetup
    ))

    try {
      const { error } = await supabase
        .from('meetups')
        .update({
          title: data.title,
          date_time: data.dateTime,
          location: data.location || null,
          notes: data.notes || null,
          updated_by: currentUser.id
        })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      // Revert optimistic update
      fetchData()
      throw error
    }
  }, [currentUser, fetchData])

  const deleteMeetup = useCallback(async (id: string) => {
    // Optimistic update
    const deletedMeetup = meetups.find(m => m.id === id)
    setMeetups(prev => prev.filter(m => m.id !== id))

    try {
      const { error } = await supabase
        .from('meetups')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      // Restore optimistic update on error
      if (deletedMeetup) {
        setMeetups(prev => [deletedMeetup, ...prev])
      }
      throw error
    }
  }, [meetups])

  // Trip CRUD operations
  const createTrip = useCallback(async (data: any) => {
    if (!currentUser) throw new Error('No user logged in')

    const tripData = {
      title: data.title,
      start_date: data.startDate,
      end_date: data.endDate,
      location: data.location || null,
      notes: data.notes || null,
      created_by: currentUser.id
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticTrip: Trip = {
      id: tempId,
      ...tripData,
      rsvps: []
    }
    setTrips(prev => [optimisticTrip, ...prev])

    try {
      const { data: result, error } = await supabase
        .from('trips')
        .insert(tripData)
        .select()
        .single()

      if (error) throw error

      // Replace optimistic update with real data
      setTrips(prev => prev.map(t => t.id === tempId ? { ...result, rsvps: [] } : t))
    } catch (error) {
      // Remove optimistic update on error
      setTrips(prev => prev.filter(t => t.id !== tempId))
      throw error
    }
  }, [currentUser])

  const updateTrip = useCallback(async (id: string, data: any) => {
    if (!currentUser) throw new Error('No user logged in')

    // Optimistic update
    setTrips(prev => prev.map(trip =>
      trip.id === id ? {
        ...trip,
        title: data.title,
        start_date: data.startDate,
        end_date: data.endDate,
        location: data.location || trip.location,
        notes: data.notes || trip.notes,
        updated_by: currentUser.id
      } : trip
    ))

    try {
      const { error } = await supabase
        .from('trips')
        .update({
          title: data.title,
          start_date: data.startDate,
          end_date: data.endDate,
          location: data.location || null,
          notes: data.notes || null,
          updated_by: currentUser.id
        })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      // Revert optimistic update
      fetchData()
      throw error
    }
  }, [currentUser, fetchData])

  const deleteTrip = useCallback(async (id: string) => {
    // Optimistic update
    const deletedTrip = trips.find(t => t.id === id)
    setTrips(prev => prev.filter(t => t.id !== id))

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      // Restore optimistic update on error
      if (deletedTrip) {
        setTrips(prev => [deletedTrip, ...prev])
      }
      throw error
    }
  }, [trips])

  // RSVP operations with optimistic updates
  const updateMeetupRsvp = useCallback(async (meetupId: string, status: 'going' | 'maybe' | 'cant' | null) => {
    if (!currentUser) return

    // Optimistic update
    setMeetups(prev => prev.map(meetup => {
      if (meetup.id === meetupId) {
        let updatedRsvps = [...(meetup.rsvps || [])]

        if (status === null) {
          // Remove user's RSVP
          updatedRsvps = updatedRsvps.filter(rsvp => rsvp.member_id !== currentUser.id)
        } else {
          // Update or add user's RSVP
          const existingIndex = updatedRsvps.findIndex(rsvp => rsvp.member_id === currentUser.id)
          if (existingIndex >= 0) {
            updatedRsvps[existingIndex] = { id: updatedRsvps[existingIndex].id, member_id: currentUser.id, status }
          } else {
            updatedRsvps.push({ id: `temp-${Date.now()}`, member_id: currentUser.id, status })
          }
        }

        return { ...meetup, rsvps: updatedRsvps }
      }
      return meetup
    }))

    try {
      let error = null

      if (status === null) {
        const result = await supabase
          .from('rsvps')
          .delete()
          .eq('meetup_id', meetupId)
          .eq('member_id', currentUser.id)
        error = result.error
      } else {
        const result = await supabase
          .from('rsvps')
          .upsert({
            meetup_id: meetupId,
            member_id: currentUser.id,
            status,
          }, {
            onConflict: 'meetup_id,member_id'
          })
        error = result.error
      }

      if (error) throw error

      // Real-time will handle updates, but also refresh to ensure consistency
      setTimeout(() => fetchData(), 1000)
    } catch (error) {
      console.error('Exception updating meetup RSVP:', error)
      // Revert optimistic update
      fetchData()
    }
  }, [currentUser, fetchData])

  const updateTripRsvp = useCallback(async (tripId: string, status: 'going' | 'maybe' | 'cant' | null) => {
    if (!currentUser) return

    // Optimistic update
    setTrips(prev => prev.map(trip => {
      if (trip.id === tripId) {
        let updatedRsvps = [...(trip.rsvps || [])]

        if (status === null) {
          // Remove user's RSVP
          updatedRsvps = updatedRsvps.filter(rsvp => rsvp.member_id !== currentUser.id)
        } else {
          // Update or add user's RSVP
          const existingIndex = updatedRsvps.findIndex(rsvp => rsvp.member_id === currentUser.id)
          if (existingIndex >= 0) {
            updatedRsvps[existingIndex] = { id: updatedRsvps[existingIndex].id, member_id: currentUser.id, status }
          } else {
            updatedRsvps.push({ id: `temp-${Date.now()}`, member_id: currentUser.id, status })
          }
        }

        return { ...trip, rsvps: updatedRsvps }
      }
      return trip
    }))

    try {
      let error = null

      if (status === null) {
        const result = await supabase
          .from('rsvps')
          .delete()
          .eq('trip_id', tripId)
          .eq('member_id', currentUser.id)
        error = result.error
      } else {
        const result = await supabase
          .from('rsvps')
          .upsert({
            trip_id: tripId,
            member_id: currentUser.id,
            status,
          }, {
            onConflict: 'trip_id,member_id'
          })
        error = result.error
      }

      if (error) throw error

      // Real-time will handle updates, but also refresh to ensure consistency
      setTimeout(() => fetchData(), 1000)
    } catch (error) {
      console.error('Exception updating trip RSVP:', error)
      // Revert optimistic update
      fetchData()
    }
  }, [currentUser, fetchData])

  // Time away operations
  const createTimeAway = useCallback(async (data: any) => {
    if (!currentUser) throw new Error('No user logged in')

    const timeAwayData = {
      member_id: data.memberId || currentUser.id,
      start_date: data.startDate,
      end_date: data.endDate,
      type: data.type || null,
      notes: data.notes || null,
      created_by: currentUser.id
    }

    try {
      const { data: result, error } = await supabase
        .from('time_away')
        .insert(timeAwayData)
        .select(`
          *,
          members!member_id(*)
        `)
        .single()

      if (error) throw error

      setTimeAway(prev => [result, ...prev])
    } catch (error) {
      console.error('Error creating time away:', error)
      throw error
    }
  }, [currentUser])

  const updateTimeAway = useCallback(async (id: string, data: any) => {
    if (!currentUser) throw new Error('No user logged in')

    try {
      const { error } = await supabase
        .from('time_away')
        .update({
          member_id: data.memberId,
          start_date: data.startDate,
          end_date: data.endDate,
          type: data.type || null,
          notes: data.notes || null
        })
        .eq('id', id)

      if (error) throw error

      setTimeAway(prev => prev.map(ta =>
        ta.id === id ? { ...ta, ...data } : ta
      ))
    } catch (error) {
      console.error('Error updating time away:', error)
      throw error
    }
  }, [currentUser])

  const deleteTimeAway = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_away')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTimeAway(prev => prev.filter(ta => ta.id !== id))
    } catch (error) {
      console.error('Error deleting time away:', error)
      throw error
    }
  }, [])

  const refreshData = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const value: DataContextType = {
    meetups,
    trips,
    timeAway,
    loading,
    setupRequired,
    refreshData,
    createMeetup,
    updateMeetup,
    deleteMeetup,
    createTrip,
    updateTrip,
    deleteTrip,
    updateMeetupRsvp,
    updateTripRsvp,
    createTimeAway,
    updateTimeAway,
    deleteTimeAway
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
