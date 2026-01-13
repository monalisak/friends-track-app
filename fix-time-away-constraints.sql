-- Fix time_away table foreign key constraints
-- Run this in Supabase SQL Editor to add missing relationships

-- Add foreign key constraints to existing time_away table
ALTER TABLE public.time_away
ADD CONSTRAINT time_away_member_id_fkey
FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;

ALTER TABLE public.time_away
ADD CONSTRAINT time_away_created_by_fkey
FOREIGN KEY (created_by) REFERENCES public.members(id);

ALTER TABLE public.time_away
ADD CONSTRAINT time_away_updated_by_fkey
FOREIGN KEY (updated_by) REFERENCES public.members(id);

-- Verify the constraints were added
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'time_away';
