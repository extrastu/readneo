'use client'

import { useWeReadStore } from '@/lib/store'
import { SetupScreen } from '@/components/setup-screen'
import { AppShell } from '@/components/app-shell'
import { DiscoverView } from '@/components/discover-view'

export default function DiscoverPage() {
  const apiKey = useWeReadStore((s) => s.apiKey)

  if (!apiKey) return <SetupScreen />

  return (
    <AppShell>
      <DiscoverView />
    </AppShell>
  )
}
