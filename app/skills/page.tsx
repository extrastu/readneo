'use client'

import { useWeReadStore } from '@/lib/store'
import { AppShell } from '@/components/app-shell'
import { SkillsView } from '@/components/skills-view'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SkillsPage() {
  const isConfigured = useWeReadStore((s) => s.isConfigured)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isConfigured) router.push('/')
  }, [mounted, isConfigured, router])

  if (!mounted || !isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AppShell>
      <SkillsView />
    </AppShell>
  )
}
