'use client'

import { useParams } from 'next/navigation'
import { useGetUserProfile } from '@/app/api/profile/profile'
import { UserProfileView } from '@/app/components/User/UserProfileView'

export default function ProfilePage() {
  const params = useParams()
  const { data: profile, isLoading } = useGetUserProfile(params.id as string)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!profile) {
    return <div>Profile not found</div>
  }

  return <UserProfileView {...profile} id={params.id as string} />
}