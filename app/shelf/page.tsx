'use client'

import { useWeReadStore } from '@/lib/store'
import { SetupScreen } from '@/components/setup-screen'
import { AppShell } from '@/components/app-shell'
import { ShelfView } from '@/components/shelf-view'
import { useEffect, useState } from 'react'

export default function ShelfPage() {
  const isConfigured = useWeReadStore((s) => s.isConfigured)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isConfigured) return <SetupScreen />

  return (
    <AppShell>
      <ShelfView />
    </AppShell>
  )
}
