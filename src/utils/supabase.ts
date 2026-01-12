import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          name: string
          color?: string
        }
        Insert: {
          id: string
          name: string
          color?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
        }
      }
      meetups: {
        Row: {
          id: string
          title: string
          date_time: string
          location?: string
          notes?: string
          created_by: string
          created_at: string
          updated_by?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          title: string
          date_time: string
          location?: string
          notes?: string
          created_by: string
          created_at?: string
          updated_by?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date_time?: string
          location?: string
          notes?: string
          created_by?: string
          created_at?: string
          updated_by?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          title: string
          start_date: string
          end_date: string
          location?: string
          notes?: string
          created_by: string
          created_at: string
          updated_by?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          title: string
          start_date: string
          end_date: string
          location?: string
          notes?: string
          created_by: string
          created_at?: string
          updated_by?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          start_date?: string
          end_date?: string
          location?: string
          notes?: string
          created_by?: string
          created_at?: string
          updated_by?: string
          updated_at?: string
        }
      }
      time_away: {
        Row: {
          id: string
          member_id: string
          start_date: string
          end_date: string
          type?: 'Holiday' | 'Work' | 'Family' | 'Other'
          notes?: string
          created_by: string
          created_at: string
          updated_by?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          member_id: string
          start_date: string
          end_date: string
          type?: 'Holiday' | 'Work' | 'Family' | 'Other'
          notes?: string
          created_by: string
          created_at?: string
          updated_by?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          start_date?: string
          end_date?: string
          type?: 'Holiday' | 'Work' | 'Family' | 'Other'
          notes?: string
          created_by?: string
          created_at?: string
          updated_by?: string
          updated_at?: string
        }
      }
      rsvps: {
        Row: {
          id: string
          meetup_id?: string
          trip_id?: string
          member_id: string
          status: 'going' | 'maybe' | 'cant'
          comment?: string
          responded_at: string
        }
        Insert: {
          id?: string
          meetup_id?: string
          trip_id?: string
          member_id: string
          status: 'going' | 'maybe' | 'cant'
          comment?: string
          responded_at?: string
        }
        Update: {
          id?: string
          meetup_id?: string
          trip_id?: string
          member_id?: string
          status?: 'going' | 'maybe' | 'cant'
          comment?: string
          responded_at?: string
        }
      }
    }
  }
}
