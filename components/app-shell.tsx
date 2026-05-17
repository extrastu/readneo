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
      <main className="md:pl-[232px]">
        <div className="mx-auto max-w-5xl px-4 py-5 pb-24 md:px-6 md:py-7 md:pb-7">
          {children}
        </div>
      </main>
    </div>
  )
}
