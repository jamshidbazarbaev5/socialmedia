// components/Navigation.tsx or components/Header.tsx
'use client'

import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { FriendRequestsBadge } from '@/app/components/User/FriendsRequestBadge'
import { useRouter } from 'next/navigation'

export function Navigation() {
    const { user } = useAuth()
    const router = useRouter()

    return (
        <nav className="bg-zinc-900 border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">

                    {user && (
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Button 
                                    variant="ghost" 
                                    className="text-white"
                                    onClick={() => router.push(`/profile/${user.profile_id}`)}
                                >
                                    Profile
                                    <FriendRequestsBadge profileId={user.profile_id} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}