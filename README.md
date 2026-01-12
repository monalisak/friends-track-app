# Friend Track

A lightweight iOS-friendly web app for a fixed group of 10 friends to manage meetups, trips, and time away. No authentication required - users select their identity from a predefined list.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Supabase Setup:**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings > API and copy your project URL and anon key
   - Run the SQL setup in `supabase-setup.sql` in your Supabase SQL Editor
   - The database will be populated with sample data

3. **Environment variables:**
   Create a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Meetups**: Create, RSVP (Going/Maybe/Can't), track attendance
- **Trips**: Multi-day group trips with RSVP system
- **Time Away**: Personal travel tracking with type categorization
- **User Identity**: Select from predefined 10-member list
- **Trust Model**: Anyone can edit/delete, attribution is visible
- **PWA**: Install on iOS home screen
- **Mobile-first**: Optimized for iPhone

## User Experience

1. **First Visit**: Select your name from the 10-member grid
2. **Dashboard**: See upcoming meetups, trips, and who's away
3. **Quick Actions**: Add meetups, trips, or time away
4. **Switch Users**: Change identity via header dropdown
5. **Attribution**: All actions show who created/edited items
6. **Timezone**: All dates and times are displayed in GMT+8

## Tech Stack

- Next.js 16 with App Router
- TypeScript + Tailwind CSS
- Supabase (Database + RLS)
- shadcn/ui components
- Lucide React icons

## Project Structure

```
src/
├── app/(app)/           # Protected routes
├── app/(public)/        # Login route
├── components/          # UI components
├── contexts/            # User context
├── lib/                 # Members list, utilities
└── utils/               # Supabase client
```

## Deploy on Vercel

The easiest way to deploy is to use [Vercel](https://vercel.com/new).
