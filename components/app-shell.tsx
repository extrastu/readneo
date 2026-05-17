'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { MobileNav } from '@/components/mobile-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <MobileNav />
      <main className="md:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
