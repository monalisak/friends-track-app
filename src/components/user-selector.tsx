"use client"

import { useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export function UserSelector() {
  const { currentUser, setCurrentUser, members } = useUser()

  if (currentUser) {
    return null // User is already selected
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Welcome to Pal Cal(ender)</CardTitle>
          <CardDescription>
            Select your name to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {members.map((member) => (
              <Button
                key={member.id}
                onClick={() => setCurrentUser(member)}
                className="h-12"
                style={{ backgroundColor: member.color }}
                variant="default"
              >
                {member.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
