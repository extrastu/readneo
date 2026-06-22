'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useWeReadStore } from '@/lib/store'
import {
  LayoutDashboard,
  Library,
  Highlighter,
  BarChart3,
  Search,
  Settings,
  LogOut,
  Sparkles,
  Download,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/', label: '概览', icon: LayoutDashboard },
  { href: '/shelf', label: '书架', icon: Library },
  { href: '/notes', label: '笔记', icon: Highlighter },
  { href: '/stats', label: '统计', icon: BarChart3 },
  { href: '/discover', label: '发现', icon: Sparkles },
  { href: '/search', label: '搜索', icon: Search },
  { href: '/skills', label: 'Skill 灵感', icon: Lightbulb },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const clearApiKey = useWeReadStore((s) => s.clearApiKey)

  function handleLogout() {
    clearApiKey()
    router.push('/')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[232px] flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/icon.svg" alt="readNeo" className="h-8 w-8 rounded-lg shadow-sm" />
        <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">readNeo</span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-1">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className={cn('h-[18px] w-[18px]', isActive && 'text-sidebar-primary')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-0.5 border-t border-sidebar-border px-3 py-3">
        <Link
          href="/export"
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
            pathname === '/export'
              ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
          )}
        >
          <Download className={cn('h-[18px] w-[18px]', pathname === '/export' && 'text-sidebar-primary')} />
          {"导出数据"}
        </Link>
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
            pathname === '/settings'
              ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
          )}
        >
          <Settings className={cn('h-[18px] w-[18px]', pathname === '/settings' && 'text-sidebar-primary')} />
          {"设置"}
        </Link>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2.5 px-2.5 h-9 text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8"
          onClick={handleLogout}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {"退出登录"}
        </Button>
      </div>
    </aside>
  )
}
