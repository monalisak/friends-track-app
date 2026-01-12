"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { MEMBERS, type Member } from '@/lib/members'

interface UserContextType {
  currentUser: Member | null
  setCurrentUser: (user: Member) => void
  members: readonly Member[]
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Member | null>(null)

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUserId = localStorage.getItem('currentUserId')
    if (savedUserId) {
      const savedUser = MEMBERS.find(m => m.id === savedUserId)
      if (savedUser) {
        setCurrentUser(savedUser)
      }
    }
  }, [])

  const handleSetCurrentUser = (user: Member) => {
    setCurrentUser(user)
    localStorage.setItem('currentUserId', user.id)
  }

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      members: MEMBERS
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
