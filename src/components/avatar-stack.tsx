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
          className="w-[34px] h-[34px] rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium -ml-2 first:ml-0"
          style={{ backgroundColor: avatar.color }}
        >
          {avatar.name.charAt(0)}
        </div>
      ))}
      {overflowCount > 0 && (
        <div className="w-[34px] h-[34px] rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 -ml-2">
          +{overflowCount}
        </div>
      )}
    </div>
  )
}
