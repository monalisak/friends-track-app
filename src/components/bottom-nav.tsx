"use client"

import { Home, Calendar, MessageCircle, Users } from "lucide-react"
import { useUser } from "@/contexts/user-context"

interface BottomNavProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  notifications?: Record<string, number>
}

export function BottomNav({ activeTab = "home", onTabChange, notifications = {} }: BottomNavProps) {
  const { currentUser } = useUser()

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "group", label: "Group", icon: Users },
    { id: "profile", label: "Profile", icon: null },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const hasNotification = notifications[tab.id] && notifications[tab.id] > 0

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className="flex flex-col items-center justify-center flex-1 py-2 relative"
              >
                {tab.id === "profile" ? (
                  // Profile avatar
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center overflow-hidden ${
                    isActive ? "border-gray-900" : "border-gray-300"
                  }`}>
                    {currentUser ? (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: currentUser.color }}
                      >
                        {currentUser.name.charAt(0)}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular icon
                  <div className={`relative ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                    {tab.icon && <tab.icon className="w-6 h-6" />}
                    {hasNotification && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                )}
                <span className={`text-xs mt-1 ${isActive ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                  {tab.id === "profile" ? "" : tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}