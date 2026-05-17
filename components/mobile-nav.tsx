'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Library,
  Sparkles,
  Search,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/', label: '概览', icon: LayoutDashboard },
  { href: '/shelf', label: '书架', icon: Library },
  { href: '/discover', label: '发现', icon: Sparkles },
  { href: '/search', label: '搜索', icon: Search },
  { href: '/settings', label: '设置', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur-xl px-1 py-1.5 md:hidden safe-area-inset-bottom">
      {navItems.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-[11px] font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground active:text-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
