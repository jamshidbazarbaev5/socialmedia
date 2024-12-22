'use client'

import { useGetFriendRequests, useAcceptFriendRequest, useRejectFriendRequest } from '@/app/api/profile/profile'
import { Button } from '@/components/ui/button'
import { UserCheck, UserX } from 'lucide-react'
import Image from 'next/image'

interface FriendRequestProps {
    profileId: string
}

interface FriendRequest {
    id: string;
    sender_id: string;
    recipient_id: string;
    sender_username: string;
    sender_first_name: string;
    sender_last_name: string;
    sender_avatar: string | null;
    status: 'SENT' | 'ACCEPTED' | 'REJECTED';
    created_at: string;
    updated_at: string;
}

export function FriendRequests({ profileId }: FriendRequestProps) {
    const { data: friendRequests, isLoading } = useGetFriendRequests(profileId)
    const acceptMutation = useAcceptFriendRequest()
    const rejectMutation = useRejectFriendRequest()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        )
    }

    if (!friendRequests?.length) {
        return (
            <div className="text-center p-4 text-zinc-400">
                No friend requests
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {friendRequests.map((request: FriendRequest) => (
                <div 
                    key={request.id} 
                    className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                >
                    <div className="flex items-center space-x-4">
                        <Image
                            src={request.sender_avatar || '/placeholder.svg'}
                            alt={request.sender_username || 'User avatar'}
                            width={48}
                            height={48}
                            className="rounded-full"
                        />
                        <div>
                            <h3 className="font-medium">
                                {request.sender_first_name} {request.sender_last_name}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                @{request.sender_username}
                            </p>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {request.status === 'ACCEPTED' ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-zinc-600 hover:bg-zinc-700"
                                onClick={() => rejectMutation.mutateAsync({
                                    profileId,
                                    requestId: request.id
                                })}
                                disabled={rejectMutation.isPending}
                            >
                                Remove
                            </Button>
                        ) : request.status === 'SENT' ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-zinc-600 hover:bg-zinc-700"
                                disabled
                            >
                                Sent
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => acceptMutation.mutateAsync({
                                        profileId,
                                        requestId: request.id
                                    })}
                                    disabled={acceptMutation.isPending}
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Accept
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => rejectMutation.mutateAsync({
                                        profileId,
                                        requestId: request.id
                                    })}
                                    disabled={rejectMutation.isPending}
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Decline
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}