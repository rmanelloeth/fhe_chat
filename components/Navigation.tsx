'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { LogoIcon } from '@/components/Logo'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: '' },
    { href: '/about', label: 'About', icon: '' },
    { href: '/chat', label: 'Chat', icon: '' },
    { href: '/profile', label: 'Profile', icon: '' },
  ]

  return (
    <header className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <LogoIcon className="w-10 h-10" />
          <span className="text-xl font-bold text-white">encrypted chatooors</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Connect Wallet Button */}
        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}

