'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useWeReadStore } from '@/lib/store'
import {
  LayoutDashboard,
  Library,
  Highlighter,
  BarChart3,
  Search,
  Settings,
  BookOpen,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: '概览', icon: LayoutDashboard },
  { href: '/shelf', label: '书架', icon: Library },
  { href: '/notes', label: '笔记', icon: Highlighter },
  { href: '/stats', label: '统计', icon: BarChart3 },
  { href: '/search', label: '搜索', icon: Search },
]

export function AppSidebar() {
  const pathname = usePathname()
  const clearApiKey = useWeReadStore((s) => s.clearApiKey)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">ReadFlow</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border p-3">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <Settings className="h-4.5 w-4.5" />
          {"设置"}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-3 px-3 text-muted-foreground hover:text-destructive"
          onClick={clearApiKey}
        >
          <LogOut className="h-4.5 w-4.5" />
          {"退出登录"}
        </Button>
      </div>
    </aside>
  )
}
