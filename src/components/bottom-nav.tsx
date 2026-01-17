"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, MessageCircle, Users, User } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/meetups", label: "Meetups", icon: Calendar },
  { href: "/trips", label: "Trips", icon: Users },
  { href: "/away", label: "Away", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: null }, // Profile will use avatar
]

export function BottomNav() {
  const pathname = usePathname()
  const { currentUser } = useUser()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard")
            const Icon = item.icon

            if (item.href === "/profile") {
              // Profile avatar tab
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 py-2 relative"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center overflow-hidden",
                    isActive ? "border-gray-900" : "border-gray-300"
                  )}>
                    {currentUser ? (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: currentUser.color }}
                      >
                        {currentUser.name.charAt(0)}
                      </div>
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 py-2 relative"
              >
                <div className={cn(
                  "relative",
                  isActive ? "text-gray-900" : "text-gray-500"
                )}>
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <span className={cn(
                  "text-xs mt-1",
                  isActive ? "text-gray-900 font-medium" : "text-gray-500"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
