"use client"

interface AvatarStackProps {
  avatars: Array<{
    id: string
    name: string
    color: string
  }>
  maxVisible?: number
}

export function AvatarStack({ avatars, maxVisible = 3 }: AvatarStackProps) {
  const visibleAvatars = avatars.slice(0, maxVisible)
  const overflowCount = avatars.length - maxVisible

  return (
    <div className="flex items-center">
      {visibleAvatars.map((avatar, index) => (
        <div
          key={avatar.id}
          className="w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-white text-xs font-medium -ml-2 first:ml-0"
          style={{ backgroundColor: avatar.color }}
        >
          {avatar.name.charAt(0)}
        </div>
      ))}
      {overflowCount > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-medium text-primary -ml-2">
          +{overflowCount}
        </div>
      )}
    </div>
  )
}
