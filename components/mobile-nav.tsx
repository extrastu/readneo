'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Library,
  Highlighter,
  BarChart3,
  Search,
} from 'lucide-react'

const navItems = [
  { href: '/', label: '概览', icon: LayoutDashboard },
  { href: '/shelf', label: '书架', icon: Library },
  { href: '/notes', label: '笔记', icon: Highlighter },
  { href: '/stats', label: '统计', icon: BarChart3 },
  { href: '/search', label: '搜索', icon: Search },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur-lg px-2 py-2 md:hidden">
      {navItems.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
