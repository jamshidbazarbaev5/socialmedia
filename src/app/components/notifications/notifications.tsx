'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/app/api/api'
import { useAuth } from '@/app/context/AuthContext'
import { useAcceptFriendRequest, useRejectFriendRequest } from '@/app/api/profile/profile'
import { useGetFriendRequests } from '@/app/api/profile/profile'
import { FriendRequest } from '@/app/types/friends'

interface Notification {
  url: string;
  message: string;
  created_at: string;
  id?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();

  const { data: friendRequests, isLoading } = useGetFriendRequests(user?.profile_id || '');
  console.log(friendRequests)

  const handleAcceptFriend = async (request: FriendRequest) => {
    try {
      const requestId = request.url.split('/').slice(-2)[0];
      const profileId = user?.profile_id || '';

      console.log(`Accepting friend request with profileId: ${profileId} and requestId: ${requestId}`);

      await acceptMutation.mutateAsync({
        profileId: profileId,
        requestId: requestId,
      });
      queryClient.invalidateQueries({ queryKey: ['friendRequests', user?.profile_id] });
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectFriend = async (request: FriendRequest) => {
    try {
      const requestId = request.url.split('/').slice(-2)[0];
      const profileId = user?.profile_id || '';

      await rejectMutation.mutateAsync({
        profileId: profileId,
        requestId: requestId,
      });

      queryClient.invalidateQueries({ queryKey: ['friendRequests', user?.profile_id] });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading...
    </div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
          {friendRequests?.map((request) => {
            return (
              <div
                key={request.url}
                className="flex items-center justify-between p-4 hover:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src="/placeholder.svg"
                    alt='p'
                    width={44}
                    height={44}
                    className="rounded-full"
                  />
                  <div className="flex-grow">
                    <p className="text-sm">
                      {request.created_by} - {request.status}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {request.created_at}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {request.status === 'ACCEPTED' ? (
                    <Button
                      variant="secondary"
                      className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-1 rounded"
                      onClick={() => handleRejectFriend(request)}
                      disabled={rejectMutation.isPending}
                    >
                      Remove
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                        onClick={() => handleAcceptFriend(request)}
                        disabled={acceptMutation.isPending}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="secondary"
                        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-1 rounded"
                        onClick={() => handleRejectFriend(request)}
                        disabled={rejectMutation.isPending}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
