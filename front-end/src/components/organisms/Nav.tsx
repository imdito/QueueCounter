'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/classname.util'

interface NavItemProps {
  href: string
  icon: string
  label: string
  isActive?: boolean
  onClick?: () => void
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive = false, onClick }) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
      onClick={onClick}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

interface NavProps {
  className?: string
}

const Nav: React.FC<NavProps> = ({ className }) => {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      icon: 'home',
      label: 'Beranda',
    },
    {
      href: '/queue-ticket',
      icon: 'confirmation_number',
      label: 'Ambil Antrian',
    },
    {
      href: '/queue-display',
      icon: 'list',
      label: 'Display Antrian',
    },
    {
      href: '/queue-status',
      icon: 'search',
      label: 'Cek Status',
    },
    {
      href: '/counter-operator',
      icon: 'person',
      label: 'Operator Counter',
    },
    {
      href: '/counter-manager',
      icon: 'settings',
      label: 'Manajemen Counter',
    },
  ]

  return (
    <nav className={cn('flex flex-col space-y-1', className)}>
      {navItems.map(item => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          isActive={pathname === item.href}
        />
      ))}
    </nav>
  )
}

export default Nav
