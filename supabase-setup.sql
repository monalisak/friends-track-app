-- Friend Track - Simplified Supabase Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUIDs
create extension if not exists "pgcrypto";

-- 1) Members (predefined list)
create table if not exists public.members (
  id text primary key,
  name text not null,
  color text
);

-- 2) Meetups
create table if not exists public.meetups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_time timestamptz not null,
  location text,
  notes text,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_by text,
  updated_at timestamptz
);

-- 3) Trips
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_date date not null,
  end_date date not null,
  location text,
  notes text,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_by text,
  updated_at timestamptz
);

-- 4) Time Away
create table if not exists public.time_away (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  start_date date not null,
  end_date date not null,
  type text check (type in ('Holiday', 'Work', 'Family', 'Other')),
  notes text,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_by text,
  updated_at timestamptz
);

-- 5) RSVPs (shared between meetups and trips)
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  meetup_id uuid references public.meetups(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  member_id text not null,
  status text not null check (status in ('going','maybe','cant')),
  comment text,
  responded_at timestamptz not null default now(),
  unique(meetup_id, member_id),
  unique(trip_id, member_id)
);

-- Enable RLS (simplified - no auth required for this app)
alter table public.members enable row level security;
alter table public.meetups enable row level security;
alter table public.trips enable row level security;
alter table public.time_away enable row level security;
alter table public.rsvps enable row level security;

-- Simple policies: allow all operations (trust-based model)
create policy "allow all operations on members" on public.members for all using (true);
create policy "allow all operations on meetups" on public.meetups for all using (true);
create policy "allow all operations on trips" on public.trips for all using (true);
create policy "allow all operations on time_away" on public.time_away for all using (true);
create policy "allow all operations on rsvps" on public.rsvps for all using (true);

-- ========================================
-- SAMPLE DATA (run after schema setup)
-- ========================================

-- Insert predefined members
INSERT INTO members (id, name, color) VALUES
  ('monalisa', 'Monalisa', '#ef4444'),
  ('steffin', 'Steffin', '#3b82f6'),
  ('kiana', 'Kiana', '#10b981'),
  ('ira', 'Ira', '#f59e0b'),
  ('saylee', 'Saylee', '#8b5cf6'),
  ('manali', 'Manali', '#ec4899'),
  ('minh_hai', 'Minh Hai', '#06b6d4'),
  ('zhan_wei', 'Zhan Wei', '#84cc16'),
  ('ben', 'Ben', '#f97316'),
  ('shawn', 'Shawn', '#6366f1');

-- Sample meetups
INSERT INTO meetups (title, date_time, location, notes, created_by) VALUES
  ('Weekly Coffee Catchup', NOW() + INTERVAL '2 days', 'Starbucks Downtown', 'Regular catchup session', 'monalisa'),
  ('New Year Party', NOW() + INTERVAL '7 days', 'Steffin''s House', 'BYO drinks and snacks', 'steffin'),
  ('Hiking Trip', NOW() + INTERVAL '14 days', 'Mountain Trail', 'Bring water and snacks', 'kiana');

-- Sample trips
INSERT INTO trips (title, start_date, end_date, location, notes, created_by) VALUES
  ('Japan Ski Trip', '2026-02-15', '2026-02-22', 'Niseko, Japan', 'Powder paradise!', 'ira'),
  ('Summer Beach Vacation', '2026-06-01', '2026-06-07', 'Maldives', 'Relaxing getaway', 'saylee');

-- Sample time away
INSERT INTO time_away (member_id, start_date, end_date, type, notes, created_by) VALUES
  ('monalisa', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', 'Work', 'Business conference', 'monalisa'),
  ('steffin', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', 'Family', 'Family visit', 'steffin'),
  ('kiana', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '22 days', 'Holiday', 'Beach vacation', 'kiana');

-- Sample RSVPs
INSERT INTO rsvps (meetup_id, member_id, status, comment) VALUES
  ((SELECT id FROM meetups WHERE title = 'Weekly Coffee Catchup' LIMIT 1), 'monalisa', 'going', 'Looking forward to it!'),
  ((SELECT id FROM meetups WHERE title = 'Weekly Coffee Catchup' LIMIT 1), 'steffin', 'maybe', 'Might be running late'),
  ((SELECT id FROM meetups WHERE title = 'New Year Party' LIMIT 1), 'monalisa', 'going', 'Bring the champagne'),
  ((SELECT id FROM meetups WHERE title = 'New Year Party' LIMIT 1), 'steffin', 'going', NULL);

INSERT INTO rsvps (trip_id, member_id, status, comment) VALUES
  ((SELECT id FROM trips WHERE title = 'Japan Ski Trip' LIMIT 1), 'ira', 'going', 'Can''t wait!'),
  ((SELECT id FROM trips WHERE title = 'Japan Ski Trip' LIMIT 1), 'saylee', 'maybe', 'Checking flights'),
  ((SELECT id FROM trips WHERE title = 'Summer Beach Vacation' LIMIT 1), 'kiana', 'going', 'Perfect timing');
