'use client'
import React, { PropsWithChildren } from 'react'
import Sidebar from '../organisms/Sidebar'
import { cn } from '@/utils/classname.util'

interface DashboardLayoutProps extends PropsWithChildren {
  className?: string
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, className }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className={cn('p-6', className)}>{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
