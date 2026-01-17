"use client"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader() {
  const { currentUser, setCurrentUser, members } = useUser()
  const [isOpen, setIsOpen] = useState(false)

  if (!currentUser) return null

  return (
    <header className="px-4 pt-3 pb-2 safe-area-inset-top">
      <div className="max-w-md mx-auto">
        <div className="card-revolut px-4 py-3">
          <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <button
              onClick={() => window.location.href = '/profile'}
              className="text-left hover:bg-gray-50 rounded-md px-2 py-1 -mx-2 -my-1 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900">You: {currentUser.name}</p>
            </button>
          </div>
        </div>

        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-50">
              <User className="w-4 h-4 mr-1" />
              Switch User
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {members.map((member) => (
              <DropdownMenuItem
                key={member.id}
                onClick={() => {
                  setCurrentUser(member)
                  setIsOpen(false)
                }}
                className="flex items-center space-x-2"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.charAt(0)}
                </div>
                <span>{member.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
        </div>
      </div>
    </header>
  )
}
