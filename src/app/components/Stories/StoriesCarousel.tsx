'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { UserCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { useProfiles } from '@/app/api/profile/profile'

export function Stories() {
    const router = useRouter()
    const { data: users, isLoading: loading, error } = useProfiles()

    if (loading) return <div className="text-center p-4 text-white/60">Loading...</div>
    if (error) return <div className="text-center text-red-500 p-4">Failed to load users</div>
    if (!users || users.length === 0) return <div className="text-center p-4 text-white/60">No users found</div>

    const extractUserId = (url: string) => {
        const matches = url.match(/profile\/([^/]+)/)
        return matches ? matches[1] : null
    }

    const handleUserClick = (url: string) => {
        const userId = extractUserId(url)
        if (userId) {
            router.push(`/profile/${userId}`)
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto relative px-12 pt-6">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-none relative">
                {users.map((user: any, index: number) => (
                    <div
                        key={user.url}
                        className="flex flex-col items-center cursor-pointer flex-shrink-0 first:ml-0 group"
                        onClick={() => handleUserClick(user.url)}
                    >
                        <div className={`w-[72px] h-[72px] rounded-full p-[2px] ${
                            index === 0 
                            ? 'bg-gradient-to-tr from-yellow-400 via-orange-400 to-pink-500' 
                            : 'bg-white/30'
                        }`}>
                            <div className="w-full h-full rounded-full border-[3px] border-black overflow-hidden bg-neutral-900">
                                {user.avatar ? (
                                    <Image
                                        src={user.avatar}
                                        alt={user.username}
                                        width={72}
                                        height={72}
                                        className="rounded-full w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                    />
                                ) : (
                                    <UserCircle className="w-full h-full text-white p-2" />
                                )}
                            </div>
                        </div>
                        <span className="text-xs mt-2 max-w-[72px] truncate text-center text-white/90 font-medium">
                            {user.username}
                        </span>
                    </div>
                ))}
            </div>
            {users.length > 7 && (
                <>
                    <button 
                        className="absolute left-2 top-[31px] z-10 bg-black/60 rounded-full p-1.5 backdrop-blur-sm hover:bg-black/80 transition-colors"
                        onClick={() => {
                            const container = document.querySelector('.overflow-x-auto')
                            if (container) {
                                container.scrollBy({ left: -200, behavior: 'smooth' })
                            }
                        }}
                    >
                        <ChevronLeft className="w-5 h-5 text-white/90" />
                    </button>
                    <button 
                        className="absolute right-2 top-[31px] z-10 bg-black/60 rounded-full p-1.5 backdrop-blur-sm hover:bg-black/80 transition-colors"
                        onClick={() => {
                            const container = document.querySelector('.overflow-x-auto')
                            if (container) {
                                container.scrollBy({ left: 200, behavior: 'smooth' })
                            }
                        }}
                    >
                        <ChevronRight className="w-5 h-5 text-white/90" />
                    </button>
                </>
            )}
        </div>
    )
}

