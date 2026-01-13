-- Debug time away data
-- Run these queries in Supabase SQL Editor to check your data

-- 1. Check what time away entries exist
SELECT
    ta.id,
    ta.member_id,
    ta.start_date,
    ta.end_date,
    ta.type,
    ta.notes,
    ta.created_by,
    ta.created_at,
    m.name as member_name,
    m.color as member_color
FROM time_away ta
LEFT JOIN members m ON ta.member_id = m.id
ORDER BY ta.created_at DESC;

-- 2. Check if member IDs in time_away match members table
SELECT
    ta.member_id,
    COUNT(*) as entries_count,
    m.name,
    m.id as member_table_id
FROM time_away ta
LEFT JOIN members m ON ta.member_id = m.id
GROUP BY ta.member_id, m.name, m.id
ORDER BY entries_count DESC;

-- 3. Check members table
SELECT id, name, color FROM members ORDER BY name;

-- 4. Test the exact query the app uses
SELECT
    ta.*,
    m.*
FROM time_away ta
LEFT JOIN members m ON ta.member_id = m.id
ORDER BY ta.start_date ASC
LIMIT 10;
