'use client'
import { cn } from '@/utils/classname.util'
import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
}

const Select: React.FC<SelectProps> = ({ className, label, error, fullWidth = false, options, id, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth ? 'w-full' : '', className)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'h-10 px-4 pr-8 rounded-md border border-gray-300 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '',
            fullWidth ? 'w-full' : ''
          )}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <span className="material-symbols-outlined text-gray-400">expand_more</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Select
