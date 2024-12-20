'use client'

import Image from 'next/image'
import { Edit3, Archive, Settings, Camera, UserPlus, MoreHorizontal, Image as ImageIcon } from 'lucide-react'
import { useGetUserFriends, useGetUserProfile } from '@/app/api/profile/profile'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FriendRequests } from '../User/FriendsRequsts'
import { PostCard } from '../Posts/PostCard'
import { useGetProfilePosts, useCreatePost } from '@/app/api/posts/posts'
interface UserProfileProps {
  url: string;
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  age: number | null;
  avatar: string | null;
  bio: string;
  birthdate: string | null;
  city: string | null;
  school: number | string;
  hobbies: string[];
  friends: string;
  posts: string;
}

export function UserProfile({
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
  hobbies,
  friends,
  posts,
}: UserProfileProps) {
  const { logout, user } = useAuth()
  const router = useRouter()
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostImages, setNewPostImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { data: userPosts } = useGetProfilePosts(id)
  const { data: userFriends } = useGetUserFriends(id)
  const createPost = useCreatePost()

  useEffect(() => {
    if (school) {
      console.log(school)
    }
  }, [school])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent && newPostImages.length === 0) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('content', newPostContent)
      
      if (newPostImages.length > 0) {
        newPostImages.forEach((file, index) => {
          formData.append(`post_attachments[${index}][image]`, file)
        })
      } else {
        formData.append('post_attachments', '[]')
      }

      console.log('Submitting post with:', {
        content: newPostContent,
        imageCount: newPostImages.length
      })

      const result = await createPost.mutateAsync({ 
        profileId: id, 
        formData 
      })
      
      console.log('Post creation successful:', result)
      
      setNewPostContent('')
      setNewPostImages([])
    } catch (error: any) {
      console.error('Post creation failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      alert(`Failed to create post: ${JSON.stringify(error.response?.data || error.message)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProfile = () => {
    router.push('/profile/edit')
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-normal">{username}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
              onClick={handleEditProfile}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="secondary"
              className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
              onClick={handleLogout}
            >
              Logout
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-8 py-8">
          <div className="relative">
            <Image
              src={avatar || '/placeholder.svg?height=150&width=150'}
              alt={username}
              width={150}
              height={150}
              className="rounded-full"
            />
          </div>
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-xl mb-1">{first_name} {last_name}</h2>
              <p className="text-zinc-400">@{username}</p>
              {bio && <p className="text-sm text-zinc-400 mt-2">{bio}</p>}
              {city && <p className="text-sm text-zinc-400 mt-2">📍 {city}</p>}
              {school && <p className="text-sm text-zinc-400">🎓 {school}</p>}
              {birthdate && (
                <p className="text-sm text-zinc-400">
                  🎂 {new Date(birthdate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-8 text-sm">
              <div>
                <span className="font-semibold">{userPosts?.length || 0}</span> posts
              </div>
              <div>
                <span className="font-semibold">{userFriends?.length || 0}</span> friends
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b border-zinc-800 bg-transparent h-auto p-0">
            {[
              {
                key: "posts",
                value: "posts",
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h4v4H7V7zm0 6h10v4H7v-4z" strokeWidth="2" />
                  </svg>
                ),
                label: "POSTS"
              },
              {
                key: "friends",
                value: "friends",
                icon: <UserPlus className="w-4 h-4" />,
                label: "FRIENDS"
              },
              {
                key: "requests",
                value: "requests",
                icon: <UserPlus className="w-4 h-4" />,
                label: "FRIEND REQUESTS"
              }
            ].map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.value}
                className="flex items-center gap-2 px-8 py-3 data-[state=active]:border-t-0 data-[state=active]:border-b-2 rounded-none bg-transparent"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="posts" className="mt-8">
            <form onSubmit={handleCreatePost} className="mb-8 bg-zinc-900 rounded-lg p-4">
              <div className="mb-4">
                <textarea
                  placeholder="What's on your mind?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white min-h-[100px] resize-none"
                />
              </div>
              
              {newPostImages.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {Array.from(newPostImages).map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...newPostImages]
                          newImages.splice(index, 1)
                          setNewPostImages(newImages)
                        }}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setNewPostImages([...newPostImages, ...files])
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 text-zinc-400 hover:text-white">
                    <ImageIcon className="h-5 w-5" />
                    <span>Add Photos</span>
                  </div>
                </label>
                
                <button
                  type="submit"
                  disabled={isSubmitting || (!newPostContent && newPostImages.length === 0)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>

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
                    id={post.id}
                    content={post.content}
                    post_attachments={post.post_attachments}
                    likes_count={post.likes_count || 0}
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

          <TabsContent value="friends" className="mt-8">
            <div className="grid grid-cols-3 gap-4">
              {userFriends?.map((friend: any) => (
                <div key={friend.id} className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg">
                  <Image
                    src={friend.avatar || '/placeholder.svg'}
                    alt={friend.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{friend.first_name} {friend.last_name}</p>
                    <p className="text-sm text-zinc-400">@{friend.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* <TabsContent value="requests" className="mt-8">*/}
          {/*  <div className="max-w-2xl mx-auto">*/}
          {/*    <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>*/}
          {/*    <FriendRequests profileId={id} />*/}
          {/*  </div>*/}
          {/*</TabsContent> */}
        </Tabs>
      </div>

     
    </div>
  )
}