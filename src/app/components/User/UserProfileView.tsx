'use client'

import Image from 'next/image'
import { useAuth } from '@/app/context/AuthContext'
import {useAddFriend, useCheckFriendStatus, useGetUserProfile, useProfiles, useGetPosts, useGetUserFriends, useBlockUser, useUnblockUser, useCheckBlacklist, useDeleteFriend, useCheckBlockedByUser} from '@/app/api/profile/profile'
import { ArrowLeft, Camera, MoreHorizontal, UserPlus, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {useState, useEffect} from "react";
import {router} from "next/client";
import {useRouter} from "next/navigation";
import Link from "next/link";
import { FriendRequests } from '@/app/components/User/FriendsRequsts'
import { FriendshipStatus } from '@/app/api/profile/profile'
import { PostCard } from '../Posts/PostCard'
import { useGetProfilePosts } from '@/app/api/posts/posts'
import { SimpleDropdown, DropdownItem } from '@/app/components/dropdown/dropdown'
import { useQueryClient } from '@tanstack/react-query'

interface UserProfileViewProps {
    url: string
    id: string
    first_name: string
    last_name: string
    username: string
    age: number | null
    avatar: string | null
    bio: string
    birthdate: string | null
    city: string | null
    school: number | null
    friends: string
    posts: string
    is_blocked?: boolean
}

interface DecodedToken {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

interface FriendStatusResponse {
  is_friend: boolean;
  is_pending: boolean;
}

const BlockedUserView = ({ username }: { username: string }) => {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
            <UserCircle className="w-16 h-16 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">@{username}</h1>
          <p className="text-zinc-400 mb-6">
            You have blocked this account
          </p>
          <p className="text-sm text-zinc-500 max-w-md">
            You can't see their posts or profile information while they're blocked. 
            Unblock them if you'd like to view their profile again.
          </p>
        </div>
      </div>
    </div>
  )
}

const BlockedByUserView = ({ username }: { username: string }) => {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
            <UserCircle className="w-16 h-16 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">@{username}</h1>
          <p className="text-zinc-400 mb-6">
            This account has blocked you
          </p>
          <p className="text-sm text-zinc-500 max-w-md">
            You cannot view their profile or interact with their content.
          </p>
        </div>
      </div>
    </div>
  );
};

export function UserProfileView({
                                    url,
                                    id,
                                    first_name,
                                    last_name,
                                    username,
                                    age,
                                    avatar,
                                    bio,
                                    birthdate,
                                    city,
                                    school,
                                    friends,
                                    posts,
                                    is_blocked,
                                }: UserProfileViewProps) {
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const { data: friendStatus } = useCheckFriendStatus(id, username)
    const addFriendMutation = useAddFriend()
    const { data: users, isLoading: loading, error } = useProfiles()
    const router = useRouter()

    const { data: selectedUserProfile, isLoading: profileLoading } = useGetUserProfile(id)
    const { data: userPosts } = useGetProfilePosts(id)
    const { data: userFriends } = useGetUserFriends(id)
    
    const [requestStatus, setRequestStatus] = useState(friendStatus?.status || null)
    const blockUser = useBlockUser()
    const unblockUser = useUnblockUser()
    const { data: isUserBlocked, isLoading: blockStatusLoading } = useCheckBlacklist(username)
    const [isBlocked, setIsBlocked] = useState(false)
    const deleteFriendMutation = useDeleteFriend()
    const { data: isBlockedByUser } = useCheckBlockedByUser(id)

    useEffect(() => {
        if (typeof isUserBlocked === 'boolean') {
            setIsBlocked(isUserBlocked)
        }
    }, [isUserBlocked])

    useEffect(() => {
        if (friendStatus?.status) {
            setRequestStatus(friendStatus.status);
        }
    }, [friendStatus?.status]);

    const handleAddFriend = async () => {
        if (!user) {
            console.error('No user logged in');
            return;
        }

        if (!id) {
            console.error('No target user ID provided');
            return;
        }

        try {
            console.log('Sending friend request with ID:', id);
            await addFriendMutation.mutateAsync({
                id,
                userData: {
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    avatar: user.avatar || null,
                },
            });
            
            setRequestStatus(FriendshipStatus.SENT);
            
            queryClient.invalidateQueries({ queryKey: ['friendStatus', id] });
            queryClient.invalidateQueries({ queryKey: ['profile', id] });
            
            console.log('Friend request sent successfully');
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    const navigateBack = () => {
        router.back()
    }
    const handleBlock = async () => {
        try {
            await blockUser.mutateAsync(id)
            setIsBlocked(true)
            queryClient.invalidateQueries({ queryKey: ['blacklist', user?.profile_id] })
            queryClient.invalidateQueries({ queryKey: ['profile', id] })
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
        } catch (error) {
            console.error('Failed to block user:', error)
            alert('Failed to block user')
        }
    }

    const handleUnblock = async () => {
        try {
            await unblockUser.mutateAsync(id)
            setIsBlocked(false)
            queryClient.invalidateQueries({ queryKey: ['blacklist', user?.profile_id] })
            queryClient.invalidateQueries({ queryKey: ['profile', id] })
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
        } catch (error) {
            console.error('Failed to unblock user:', error)
            alert('Failed to unblock user')
        }
    }

    const handleReport = () => {
        alert('Report functionality coming soon')
    }

    const handleDeleteFriend = async () => {
        try {
            await deleteFriendMutation.mutateAsync({
                profileId: user?.profile_id || '',
                friendId: id
            })
            setRequestStatus(null)
            queryClient.invalidateQueries({ queryKey: ['friendStatus', id] })
            queryClient.invalidateQueries({ queryKey: ['profile', id] })
        } catch (error) {
            console.error('Failed to delete friend:', error)
            alert('Failed to remove friend')
        }
    }

    const renderFriendButton = () => {
        if (user?.profile_id === id) {
            return null;
        }

        const status = requestStatus || friendStatus?.status;

        switch (status) {
            case FriendshipStatus.ACCEPTED:
                return (
                    <Button
                        variant="secondary"
                        className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                    >
                        Friends
                    </Button>
                );
            case FriendshipStatus.SENT:
                return (
                    <Button
                        variant="secondary"
                        className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                        disabled
                    >
                        Request Sent
                    </Button>
                );
            case FriendshipStatus.REJECTED:
                return (
                    <Button
                        variant="secondary"
                        className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                        onClick={handleAddFriend}
                        disabled={addFriendMutation.isPending}
                    >
                        <UserPlus className="h-4 w-4 mr-2"/>
                        Add Friend
                    </Button>
                );
            default:
                return (
                    <Button
                        variant="secondary"
                        className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                        onClick={handleAddFriend}
                        disabled={addFriendMutation.isPending}
                    >
                        <UserPlus className="h-4 w-4 mr-2"/>
                        {addFriendMutation.isPending ? 'Sending...' : 'Add Friend'}
                    </Button>
                );
        }
    };

    if (isBlockedByUser) {
        return (
            <div>
                <div className="max-w-4xl mx-auto px-4">
                    <button
                        onClick={navigateBack}
                        className="mb-4 px-4 py-2 text-white"
                    >
                        <ArrowLeft className="h-7 w-7 mr-2"/>
                    </button>
                </div>
                <BlockedByUserView username={username} />
            </div>
        );
    }

    return (
        <div className="bg-black text-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4">
                <button
                    onClick={navigateBack}
                    className="mb-4 px-4 py-2 text-white"
                >
                    <ArrowLeft className="h-7 w-7 mr-2"/>
                </button>

                {isBlocked && (
                    <div className="bg-zinc-800 p-4 mb-4 rounded-lg">
                        <p className="text-zinc-400 text-sm">
                            You have blocked this user. They cannot see your profile or interact with your content.
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between py-4">
                    <h1 className="text-xl font-normal">{username}</h1>
                    <div className="flex items-center gap-2">
                        {renderFriendButton()}
                        <Button
                            variant="secondary"
                            className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                        >
                            Send Message
                        </Button>
                        {user?.profile_id !== id && (
                            <SimpleDropdown
                                trigger={
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                                    >
                                        <MoreHorizontal className="h-4 w-4"/>
                                    </Button>
                                }
                            >
                                {requestStatus === FriendshipStatus.ACCEPTED && (
                                    <DropdownItem
                                        onClick={handleDeleteFriend}
                                        className="text-red-500"
                                        disabled={deleteFriendMutation.isPending}
                                    >
                                        Remove Friend
                                    </DropdownItem>
                                )}
                                <DropdownItem
                                    onClick={isBlocked ? handleUnblock : handleBlock}
                                    className="text-red-500"
                                    disabled={blockStatusLoading}
                                >
                                    {blockStatusLoading ? 'Loading...' : isBlocked ? 'Unblock User' : 'Block User'}
                                </DropdownItem>
                            </SimpleDropdown>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-8 py-8">
                    <div className="relative w-[150px] h-[150px] rounded-full bg-zinc-800">
                        {avatar ? (
                            <Image
                                src={avatar}
                                alt={username}
                                width={150}
                                height={150}
                                className="rounded-full object-cover"
                                priority
                            />
                        ) : (
                            <UserCircle className="w-full h-full text-white p-2" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="mb-6">
                            <h2 className="text-xl mb-1">{first_name} {last_name}</h2>
                            <p className="text-zinc-400">@{username}</p>
                            {bio && <p className="text-sm text-zinc-400 mt-2">{bio}</p>}
                            {city && <p className="text-sm text-zinc-400 mt-2">{city}</p>}
                        </div>
                        <div className="flex gap-8 text-sm">
                            <div>
                                <span 
                                    className="font-semibold">{userPosts?.length || 0}</span> posts
                            </div>
                            <div>
                                <span 
                                    className="font-semibold">{userFriends?.length || 0}</span> followers
                            </div>
                            <div>
                                <span className="font-semibold">0</span> following
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="w-full justify-start border-b border-zinc-800 bg-transparent h-auto p-0">
                        <TabsTrigger
                            value="posts"
                            className="flex items-center gap-2 px-8 py-3 data-[state=active]:border-t-0 data-[state=active]:border-b-2 rounded-none bg-transparent"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h4v4H7V7zm0 6h10v4H7v-4z"
                                    strokeWidth="2"
                                />
                            </svg>
                            POSTS
                        </TabsTrigger>
                        <TabsTrigger
                            value="tags"
                            className="flex items-center gap-2 px-8 py-3 data-[state=active]:border-t-0 data-[state=active]:border-b-2 rounded-none bg-transparent"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M20 4h-8l-2-2H4C2.9 2 2 2.9 2 4v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"
                                    strokeWidth="2"
                                />
                            </svg>
                            TAGS
                        </TabsTrigger>
                        {user?.profile_id === id && (
                            <TabsTrigger
                                value="requests"
                                className="flex items-center gap-2 px-8 py-3 data-[state=active]:border-t-0 data-[state=active]:border-b-2 rounded-none bg-transparent"
                            >
                                <UserPlus className="w-4 h-4" />
                                FRIEND REQUESTS
                            </TabsTrigger>
                        )}
                    </TabsList>
                    <TabsContent value="posts" className="mt-8">
                        {!userPosts || userPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-4">
                                    <Camera className="w-12 h-12"/>
                                </div>
                                <h3 className="text-2xl font-semibold mb-4">
                                    No Posts Yet
                                </h3>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userPosts.map((post: any) => (
                                    <PostCard
                                        key={post.id}
                                        url={post.url}
                                        id={post.id}
                                        profileId={id}
                                        currentUserId={user?.profile_id}
                                        content={post.content}
                                        post_attachments={post.post_attachments}
                                        likes_count={post.likes || 0}
                                        comments_count={post.comments_count || 0}
                                        user={{
                                            username: username,
                                            avatar: avatar || '/placeholder.svg'
                                        }}
                                        created_at={post.created_at}
                                        isLiked={post.is_liked}
                                        comments={post.comments || []}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    {/*<TabsContent value="tags" className="mt-8">*/}
                    {/*    <div className="flex flex-col items-center justify-center py-16">*/}
                    {/*        <div*/}
                    {/*            className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-4">*/}
                    {/*            <Camera className="w-12 h-12"/>*/}
                    {/*        </div>*/}
                    {/*        <h3 className="text-2xl font-semibold mb-4">*/}
                    {/*            Нет отмеченных публикаций*/}
                    {/*        </h3>*/}
                    {/*    </div>*/}
                    {/*</TabsContent>*/}
                    {/*{user?.profile_id === id && (*/}
                    {/*    <TabsContent value="requests" className="mt-8">*/}
                    {/*        <div className="max-w-2xl mx-auto">*/}
                    {/*            <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>*/}
                    {/*            <FriendRequests profileId={id} />*/}
                    {/*        </div>*/}
                    {/*    </TabsContent>*/}
                    {/*)}*/}
                </Tabs>
            </div>
        </div>
    )
}
