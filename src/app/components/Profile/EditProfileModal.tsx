'use client'

import { useState, useEffect } from 'react'
import { useUpdateProfile } from '@/app/api/profile/profile'
import { useGetCities, useGetHobbies, useGetSchools } from '@/app/api/utils/utils'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface City {
  name: string;
}

interface School {
  name: string;
}

interface Hobby {
  name: string;
}

interface ProfileData {
  id: string
  username: string
  first_name: string
  last_name: string
  bio: string
  birthdate: string | null
  city: number | string
  school: string
  hobbies: string[]
  is_public: boolean
  avatar?: string
}

export default function EditProfile({ currentProfile }: { currentProfile: ProfileData }) {
  const router = useRouter()
  const [formData, setFormData] = useState<ProfileData>({
    ...currentProfile,
    hobbies: currentProfile.hobbies || [],
    school: currentProfile.school?.toString() || '',
    city: currentProfile.city || '',
    birthdate: currentProfile.birthdate || null,
    is_public: currentProfile.is_public || false
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const updateProfileMutation = useUpdateProfile()
  const { data: cities } = useGetCities()
  const { data: hobbies } = useGetHobbies()
  const { data: schools } = useGetSchools()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const imageUrl = URL.createObjectURL(file)
      handleChange('avatar', imageUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    try {
      const formDataToSend = new FormData()
      
      // Append the file if selected
      if (selectedFile) {
        formDataToSend.append('avatar', selectedFile)
      }
      
      // Append all other form fields
      formDataToSend.append('username', formData.username)
      formDataToSend.append('first_name', formData.first_name)
      formDataToSend.append('last_name', formData.last_name)
      formDataToSend.append('bio', formData.bio)
      formDataToSend.append('is_public', String(formData.is_public))
      
      // Append optional fields only if they have values
      if (formData.birthdate) {
        formDataToSend.append('birthdate', formData.birthdate)
      }
      if (formData.school) {
        formDataToSend.append('school', formData.school)
      }
      if (formData.city) {
        formDataToSend.append('city', String(formData.city))
      }
      if (formData.hobbies.length > 0) {
        formDataToSend.append('hobbies', formData.hobbies.join(','))
      }

      await updateProfileMutation.mutateAsync({
        id: currentProfile.id,
        data: formDataToSend
      })
      router.push('/profile')
    } catch (error: any) {
      setErrors(error)
    }
  }

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  useEffect(() => {
    return () => {
      if (formData.avatar && formData.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(formData.avatar)
      }
    }
  }, [formData.avatar])

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-normal">Edit Profile</h1>
      </div>
      
      <div className="bg-zinc-900 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
            {formData.avatar ? (
              <Image 
                src={formData.avatar} 
                alt={formData.username} 
                width={48} 
                height={48} 
                className="h-full w-full rounded-full object-cover" 
              />
            ) : (
              <span className="text-xl text-zinc-400">{formData.username?.[0]}</span>
            )}
          </div>
          <div>
            <p className="font-medium">{formData.username}</p>
          </div>
        </div>
        <div className="relative">
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="avatar-upload"
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer inline-block"
          >
            Change Photo
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-normal">Bio</h2>
          <div className="relative">
            <textarea 
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell about yourself"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white min-h-[100px] focus:outline-none focus:border-zinc-700 transition-colors"
              maxLength={150}
            />
            <span className="absolute bottom-2 right-2 text-sm text-zinc-400">
              {formData.bio?.length || 0}/150
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-normal">Profile Privacy</h2>
          <div className="flex items-center justify-between">
            <label htmlFor="privacy-toggle" className="text-sm text-zinc-400">Make profile public</label>
            <input 
              type="checkbox"
              id="privacy-toggle"
              checked={formData.is_public}
              onChange={(e) => handleChange('is_public', e.target.checked)}
              className="h-5 w-5 rounded border-zinc-800 bg-zinc-900 text-blue-500 focus:ring-0 focus:ring-offset-0"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-normal">Location</h2>
          <select 
            value={formData.city?.toString() || ''} 
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-700 transition-colors"
          >
            <option value="">Select city</option>
            {cities?.map((city, index) => (
              <option key={index} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-normal">Education</h2>
          <select 
            value={formData.school || ''} 
            onChange={(e) => handleChange('school', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-700 transition-colors"
          >
            <option value="">Select school</option>
            {schools?.map((school, index) => (
              <option key={index} value={school.name}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-normal">Interests</h2>
          <select 
            value={formData.hobbies[0] || ''} 
            onChange={(e) => handleChange('hobbies', [e.target.value])}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-700 transition-colors"
          >
            <option value="">Select interests</option>
            {hobbies?.map((hobby, index) => (
              <option key={index} value={hobby.name}>
                {hobby.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-6">
          <button 
            type="submit"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

