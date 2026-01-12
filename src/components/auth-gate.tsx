"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For now, skip auth checks when Supabase isn't configured
    // In production, this would check authentication and group membership
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // For development without Supabase, just show the app
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <>{children}</>
  }

  // TODO: Implement proper auth checks when Supabase is configured
  return <>{children}</>
}
