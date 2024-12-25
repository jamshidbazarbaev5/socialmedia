'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useGetUserFriends, useDeleteFriend } from '@/app/api/profile/profile'
import { UserCircle } from 'lucide-react'

interface Friend {
    id: string
    username: string
    first_name: string
    last_name: string
    avatar: string | null
}

interface FriendsModalProps {
    isOpen: boolean
    onClose: () => void
    profileId: string
}

const extractIdFromUrl = (url: string) => {
    const matches = url.match(/profile\/([^/]+)/);
    return matches ? matches[1] : null;
};

export default function FriendsModal({ isOpen, onClose, profileId }: FriendsModalProps) {
    const router = useRouter()
    const { data: friends, isLoading } = useGetUserFriends(profileId)
    const deleteFriend = useDeleteFriend()
    const [searchQuery, setSearchQuery] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)

    if (!isOpen) return null

    const filteredFriends = friends?.filter((friend: any) => 
        friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${friend.first_name} ${friend.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    const handleUserClick = (friendUrl: string) => {
        const friendId = extractIdFromUrl(friendUrl)
        if (friendId) {
            onClose() // Close the modal first
            router.push(`/profile/${friendId}`) // Navigate to the profile page
        }
    }

    const handleRemoveFriend = async (friendUrl: string) => {
        const friendId = extractIdFromUrl(friendUrl);
        if (!friendId) {
            console.error('Could not extract friend ID from URL');
            return;
        }

        try {
            setDeletingId(friendId)
            await deleteFriend.mutateAsync({ 
                profileId, 
                friendId 
            })
        } catch (error) {
            console.error('Error removing friend:', error)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 w-full max-w-md rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                    <h2 className="text-white text-lg font-medium">Friends</h2>
                    <button 
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <svg 
                            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search friends"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-800 text-white placeholder-zinc-500 pl-10 pr-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-zinc-700"
                        />
                    </div>
                </div>

                {/* Friends List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-8 text-zinc-500">Loading...</div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            {searchQuery ? 'No friends found' : 'No friends yet'}
                        </div>
                    ) : (
                        filteredFriends.map((friend: any) => (
                            <div 
                                key={extractIdFromUrl(friend.url)}
                                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50"
                            >
                                <div 
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleUserClick(friend.url)}
                                >
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                                        {friend.avatar ? (
                                            <Image
                                                src={friend.avatar}
                                                alt={friend.username}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserCircle className="w-full h-full text-white p-2" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">
                                            {friend.first_name} {friend.last_name}
                                        </div>
                                        <div className="text-zinc-400 text-sm">
                                            @{friend.username}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFriend(friend.url);
                                    }}
                                    disabled={deletingId === extractIdFromUrl(friend.url)}
                                    className="px-4 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    {deletingId === extractIdFromUrl(friend.url) ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}