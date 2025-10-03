'use client'
import { cn } from '@/utils/classname.util'
import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

const Textarea: React.FC<TextareaProps> = ({ className, label, error, fullWidth = false, id, ...props }) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth ? 'w-full' : '', className)}>
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        className={cn(
          'min-h-[80px] px-4 py-2 rounded-md border border-gray-300 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '',
          fullWidth ? 'w-full' : ''
        )}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Textarea
