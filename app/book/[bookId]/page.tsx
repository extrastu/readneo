'use client'

import { useWeReadStore } from '@/lib/store'
import { SetupScreen } from '@/components/setup-screen'
import { AppShell } from '@/components/app-shell'
import { BookDetailView } from '@/components/book-detail-view'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function BookDetailPage() {
  const isConfigured = useWeReadStore((s) => s.isConfigured)
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const bookId = params.bookId as string

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
      <BookDetailView bookId={bookId} />
    </AppShell>
  )
}
