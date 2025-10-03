'use client'
import React from 'react'
import { cn } from '@/utils/classname.util'
import Nav from '../organisms/Nav'

interface SidebarProps {
  className?: string
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <div className={cn('w-64 border-r border-gray-200 bg-white h-screen flex flex-col', className)}>
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Queue Management</h1>
        <p className="text-sm text-gray-500">Sistem Manajemen Antrian</p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Nav />
      </div>
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Queue Management System
      </div>
    </div>
  )
}

export default Sidebar
