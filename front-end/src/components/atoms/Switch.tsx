'use client'
import { cn } from '@/utils/classname.util'
import React from 'react'

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

const Switch: React.FC<SwitchProps> = ({ className, label, description, id, ...props }) => {
  const switchId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="relative inline-flex items-center">
        <input type="checkbox" id={switchId} className="peer sr-only" {...props} />
        <div className="h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-blue-600 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label htmlFor={switchId} className="text-sm font-medium text-gray-700 peer-disabled:opacity-50">
              {label}
            </label>
          )}
          {description && <span className="text-xs text-gray-500 peer-disabled:opacity-50">{description}</span>}
        </div>
      )}
    </div>
  )
}

export default Switch
