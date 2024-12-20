// components/User/FriendRequestsBadge.tsx
'use client'

import { useGetFriendRequests } from '@/app/api/profile/profile'

interface FriendRequestsBadgeProps {
    profileId: string
}

export function FriendRequestsBadge({ profileId }: FriendRequestsBadgeProps) {
    const { data: friendRequests } = useGetFriendRequests(profileId)
    
    if (!friendRequests?.length) return null

    return (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {friendRequests.length}
        </span>
    )
}