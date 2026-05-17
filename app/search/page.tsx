'use client'

import { useWeReadStore } from '@/lib/store'
import { AppShell } from '@/components/app-shell'
import { SearchView } from '@/components/search-view'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AppShell>
      <SearchView />
    </AppShell>
  )
}
