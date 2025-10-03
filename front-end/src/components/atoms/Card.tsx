'use client'
import { cn } from '@/utils/classname.util'
import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'ghost'
}

const Card: React.FC<CardProps> = ({ children, className, variant = 'default', ...props }) => {
  const variantStyles = {
    default: 'bg-white shadow-md',
    outline: 'bg-white border border-gray-200',
    ghost: 'bg-transparent',
  }

  return (
    <div className={cn('rounded-lg p-6', variantStyles[variant], className)} {...props}>
      {children}
    </div>
  )
}

export default Card
