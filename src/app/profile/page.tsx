"use client"

import { UserProfile } from '@/app/components/User/UserProfile'
import { useGetUserProfile } from '@/app/api/profile/profile'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


const ProfilePage = () => {
  const { profileId, isAuthenticated } = useAuth()
  const router = useRouter()

  const { data: profile, isLoading, error } = useGetUserProfile(profileId || '')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null
  if (!profileId) return <div>No profile ID found</div>
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading profile</div>
  if (!profile) return <div>Profile not found</div>

  return (
    <UserProfile
      url={profile.url}
      id={profile.id}
      first_name={profile.first_name}
      last_name={profile.last_name}
      username={profile.username}
      age={profile.age}
      avatar={profile.avatar}
      bio={profile.bio}
      birthdate={profile.birthdate}
      city={profile.city}
      school={profile.school}
      friends={profile.friends}
      posts={profile.posts}
      notifications={profile.notifications}
      blacklist={profile.blacklist}
      friendship_requests={profile.friendship_requests}
    />
  )
}

export default ProfilePage