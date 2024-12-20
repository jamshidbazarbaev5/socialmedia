'use client'

import { useAuth } from '@/app/context/AuthContext'
import { useGetUserProfile } from '@/app/api/profile/profile'
import { useRouter } from 'next/navigation'
import EditProfile from '@/app/components/Profile/EditProfileModal'

const EditProfilePage = () => {
  const { profileId, isAuthenticated } = useAuth()
  const router = useRouter()
  const { data: profile, isLoading, error } = useGetUserProfile(profileId || '')

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (!profileId) return <div>No profile ID found</div>
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading profile</div>
  if (!profile) return <div>Profile not found</div>

  return <EditProfile currentProfile={profile} />
}

export default EditProfilePage