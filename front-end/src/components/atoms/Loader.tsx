'use client'
import React from 'react'
import { cn } from '@/utils/classname.util'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

export function Loader({ size = 'md', className, fullScreen = false }: LoaderProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const containerClasses = cn(
    'flex items-center justify-center',
    fullScreen && 'fixed inset-0 bg-white/80 z-50',
    className
  )

  return (
    <div className={containerClasses}>
      <div className="animate-spin">
        <span
          className={cn('material-symbols-outlined text-blue-600', {
            'text-lg': size === 'sm',
            'text-2xl': size === 'md',
            'text-3xl': size === 'lg',
          })}
        >
          progress_activity
        </span>
      </div>
    </div>
  )
}
