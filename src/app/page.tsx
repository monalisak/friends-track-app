import { redirect } from 'next/navigation'

export default function RootPage() {
  // Always redirect to dashboard - user selection is handled by UserSelector component
  redirect('/dashboard')
}
