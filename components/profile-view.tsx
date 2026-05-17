'use client'

import { useShelf, useReadDetailOverall, useNotebooks, fetchWeRead } from '@/hooks/use-weread'
import { useWeReadStore } from '@/lib/store'
import { API } from '@/lib/weread'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Highlighter, Calendar, Library, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function formatReadTime(seconds: number): string {
  if (!seconds) return '0 分钟'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

interface BookWithProgress {
  bookInfo: Record<string, unknown>
  progress: number
  readingTime: number
  updateTime: number
}

export function ProfileView() {
  const { data: shelfData, isLoading: shelfLoading } = useShelf()
  const { data: overallData, isLoading: overallLoading } = useReadDetailOverall()
  const { data: notebooksData } = useNotebooks()
  const apiKey = useWeReadStore((s) => s.apiKey)

  const [booksWithProgress, setBooksWithProgress] = useState<BookWithProgress[]>([])
  const [progressLoading, setProgressLoading] = useState(false)

  const books = shelfData?.books || []
  const albums = shelfData?.albums || []
  const allItems = [...(Array.isArray(books) ? books : []), ...(Array.isArray(albums) ? albums : [])]
  const totalBooks = allItems.length + (shelfData?.mp ? 1 : 0)

  const totalReadTime = (overallData?.totalReadTime || 0) as number
  const readDays = (overallData?.readDays || 0) as number
  const noteCount = (notebooksData?.totalNoteCount || 0) as number

  // Fetch per-book progress for the first 20 books
  useEffect(() => {
    if (!apiKey || allItems.length === 0) return

    let cancelled = false
    setProgressLoading(true)

    async function loadProgress() {
      const top20 = allItems.slice(0, 20)
      const results: BookWithProgress[] = []

      // Fetch in batches of 5
      for (let i = 0; i < top20.length; i += 5) {
        const batch = top20.slice(i, i + 5)
        const promises = batch.map(async (item: Record<string, unknown>) => {
          const bookInfo = (item.bookInfo || item) as Record<string, unknown>
          const bookId = bookInfo.bookId as string
          if (!bookId) return null

          try {
            const progData = await fetchWeRead(apiKey!, API.BOOK_GET_PROGRESS, { bookId })
            const bookProg = (progData?.book || {}) as Record<string, unknown>
            return {
              bookInfo,
              progress: (bookProg.progress || 0) as number,
              readingTime: (bookProg.recordReadingTime || 0) as number,
              updateTime: (bookProg.updateTime || 0) as number,
            }
          } catch {
            return {
              bookInfo,
              progress: 0,
              readingTime: 0,
              updateTime: 0,
            }
          }
        })

        const batchResults = await Promise.all(promises)
        if (cancelled) return
        results.push(...(batchResults.filter(Boolean) as BookWithProgress[]))
      }

      if (!cancelled) {
        // Sort by most recently read
        results.sort((a, b) => b.updateTime - a.updateTime)
        setBooksWithProgress(results)
        setProgressLoading(false)
      }
    }

    loadProgress()
    return () => { cancelled = true }
  }, [apiKey, allItems.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {"我的阅读"}
        </h1>
        <p className="mt-1 text-muted-foreground">{"阅读概况与进度一览"}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={Library}
          label="书架藏书"
          value={`${totalBooks}`}
          loading={shelfLoading}
        />
        <SummaryCard
          icon={Clock}
          label="总阅读时长"
          value={formatReadTime(totalReadTime)}
          loading={overallLoading}
        />
        <SummaryCard
          icon={Calendar}
          label="阅读天数"
          value={`${readDays} 天`}
          loading={overallLoading}
        />
        <SummaryCard
          icon={Highlighter}
          label="笔记数量"
          value={`${noteCount}`}
          loading={shelfLoading}
        />
      </div>

      {/* Books with progress */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{"阅读进度"}</h2>
          <Link href="/shelf" className="text-sm text-primary hover:underline">
            {"查看全部"}
          </Link>
        </div>

        {(shelfLoading || progressLoading) && booksWithProgress.length === 0 ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="flex gap-4 p-4">
                  <Skeleton className="h-20 w-14 shrink-0 rounded-md" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : booksWithProgress.length > 0 ? (
          <div className="flex flex-col gap-3">
            {booksWithProgress.map((bp, i) => {
              const title = (bp.bookInfo.title || '未知书名') as string
              const author = (bp.bookInfo.author || '') as string
              const cover = (bp.bookInfo.cover || '') as string
              const bookId = (bp.bookInfo.bookId || '') as string

              return (
                <Link key={bookId || i} href={bookId ? `/book/${bookId}` : '#'}>
                  <Card className="border-border hover:bg-accent/50 transition-colors cursor-pointer group">
                    <CardContent className="flex gap-4 p-4">
                      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-accent">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground truncate">{title}</span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs text-muted-foreground">{author}</span>
                        <div className="flex items-center gap-3 mt-1">
                          <Progress value={bp.progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium text-foreground shrink-0">{`${bp.progress}%`}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {bp.readingTime > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatReadTime(bp.readingTime)}
                            </span>
                          )}
                          {bp.updateTime > 0 && (
                            <span>{formatDate(bp.updateTime)}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">{"书架为空"}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType
  label: string
  value: string
  loading: boolean
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <span className="text-2xl font-semibold tracking-tight text-foreground">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
