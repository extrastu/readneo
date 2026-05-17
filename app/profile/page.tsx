'use client'

import { useWeReadStore } from '@/lib/store'
import { SetupScreen } from '@/components/setup-screen'
import { AppShell } from '@/components/app-shell'
import { ProfileView } from '@/components/profile-view'

export default function ProfilePage() {
  const apiKey = useWeReadStore((s) => s.apiKey)

  if (!apiKey) return <SetupScreen />

  return (
    <AppShell>
      <ProfileView />
    </AppShell>
  )
}
