"use client"

import { MessageCircle, Phone, Settings, Sun, User2, Bell } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from 'react'
import NotificationsPage from '@/app/components/notifications/notifications'

export function Sidebar() {
    const pathname = usePathname()
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

    return (
        <>
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex-col justify-between border-r border-zinc-800 bg-black">
                <div className="flex h-full flex-col items-center">
                    <Link
                        href="/"
                        className="flex h-16 w-full items-center justify-center "

                    >

                    </Link>

                    <nav className="flex flex-1 flex-col items-start gap-4 pt-8 w-full px-4">
                        <NavItem href="/profile" icon={User2} isActive={pathname === "/profile"}  />
                        <NavItem href="/calls" icon={Phone} isActive={pathname === "/calls"} />
                        <NavItem href="/messages" icon={MessageCircle} isActive={pathname === "/messages"} />
                        <NavItem href="/settings" icon={Settings} isActive={pathname === "/settings"} />
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className={`flex h-12 w-full items-center rounded-lg transition-colors hover:bg-gray-800 hover:text-white px-3 gap-4
                            ${isNotificationsOpen ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                        >
                            <Bell className="h-5 w-5" />
                            <span className="font-medium">Notifications</span>
                        </button>
                    </nav>

                    <button
                        className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                        onClick={() => document.documentElement.classList.toggle('dark')}
                    >
                        <Sun className="h-5 w-5" />
                        <span className="sr-only">Toggle theme</span>
                    </button>
                </div>
            </aside>

            <div
                className={`fixed right-0 top-0 h-screen w-96 bg-black transform transition-transform duration-300 ease-in-out z-50 border-l border-zinc-800 overflow-y-auto
                ${isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-4">
                    <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="mb-4 text-gray-400 hover:text-white"
                    >
                        Close
                    </button>
                    <NotificationsPage />
                </div>
            </div>

            {isNotificationsOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                />
            )}
        </>
    )
}

interface NavItemProps {
    href: string
    icon: React.ElementType
    isActive?: boolean
}

function NavItem({ href, icon: Icon, isActive }: NavItemProps) {
    return (
        <Link
            href={href}
            className={`flex h-12 w-full items-center rounded-lg transition-colors hover:bg-zinc-800 hover:text-white px-3 gap-4
            ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{href.replace('/', '').charAt(0).toUpperCase() + href.replace('/', '').slice(1)}</span>
            <span className="sr-only">Navigate to {href.replace('/', '')}</span>

        </Link>
    )
}


