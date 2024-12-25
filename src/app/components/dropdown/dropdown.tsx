'use client'

import { useState, useRef, useEffect, JSX } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function SimpleDropdown({ 
  trigger, 
  children, 
  align = 'right',
  className = ''
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-48 rounded-lg overflow-hidden`}
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.35)',
              transformOrigin: align === 'right' ? 'top right' : 'top left',
            }}
          >
            <div 
              className="backdrop-blur-lg bg-zinc-900/90 border border-zinc-800/50 rounded-lg"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <div className="py-1 divide-y divide-zinc-800/50" role="menu" aria-orientation="vertical">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DropdownItem({ 
  onClick, 
  children, 
  className = '',
  disabled = false,
  icon,
  destructive = false
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  destructive?: boolean;
}): JSX.Element {
  return (
    <button
      className={`
        block w-full text-left px-4 
        py-2.5 text-sm
        transition-colors duration-150
        ${destructive 
          ? 'text-red-500 hover:bg-red-500/10' 
          : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  )
}