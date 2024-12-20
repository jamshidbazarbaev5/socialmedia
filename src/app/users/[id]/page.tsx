'use client'

import { useGetUserProfile } from '@/app/api/profile/profile'
import { UserProfileView } from '@/app/components/User/UserProfileView'
import { useParams } from 'next/navigation'

export default function UserProfilePage() {
  const params = useParams()
  const id = params.id as string
  

  const { data: profile, isLoading, error } = useGetUserProfile(id)

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Error loading profile</div>
  }

  if (!profile) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Profile not found</div>
  }

  return <UserProfileView {...profile} />
}

