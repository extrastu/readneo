'use client'

import { useShelf, useReadDetailOverall, useNotebooks, fetchWeRead } from '@/hooks/use-weread'
import { useWeReadStore } from '@/lib/store'
import { API } from '@/lib/weread'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Bookmark, Calendar, ArrowRight, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface BookWithProgress {
  bookInfo: Record<string, unknown>
  progress: number
  readingTime: number
  updateTime: number
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: string
  loading: boolean
  accent?: boolean
}) {
  return (
    <Card className={`border-0 shadow-sm transition-all hover:shadow-md ${accent ? 'bg-primary/5' : 'bg-card'}`}>
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent ? 'bg-primary/15' : 'bg-muted'}`}>
          <Icon className={`h-[18px] w-[18px] ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[13px] text-muted-foreground truncate">{label}</span>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <span className="text-xl font-semibold tracking-tight text-foreground truncate">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatReadTime(seconds: number): string {
  if (!seconds) return '0 分钟'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes} 分钟`
}

function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function DashboardView() {
  const { data: shelfData, isLoading: shelfLoading } = useShelf()
  const { data: overallData, isLoading: overallLoading } = useReadDetailOverall()
  const { data: notebooksData, isLoading: notebooksLoading } = useNotebooks()
  const apiKey = useWeReadStore((s) => s.apiKey)

  const [booksWithProgress, setBooksWithProgress] = useState<BookWithProgress[]>([])
  const [progressLoading, setProgressLoading] = useState(false)

  const books = shelfData?.books || []
  const albums = shelfData?.albums || []
  const allItems = [...(Array.isArray(books) ? books : []), ...(Array.isArray(albums) ? albums : [])]
  const recentBooks = allItems.slice(0, 8)
  const totalBooks = allItems.length + (shelfData?.mp ? 1 : 0)

  const readTime = (overallData?.totalReadTime || 0) as number
  const readDays = (overallData?.readDays || 0) as number
  const noteCount = (notebooksData?.totalNoteCount || 0) as number

  // Fetch per-book progress for the first 10 books
  useEffect(() => {
    if (!apiKey || allItems.length === 0) return

    let cancelled = false
    setProgressLoading(true)

    async function loadProgress() {
      const top10 = allItems.slice(0, 10)
      const results: BookWithProgress[] = []

      // Fetch in batches of 5
      for (let i = 0; i < top10.length; i += 5) {
        const batch = top10.slice(i, i + 5)
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {"阅读概览"}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">{"管理你的阅读数据与书摘笔记"}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="书架藏书"
          value={`${totalBooks} 本`}
          loading={shelfLoading}
          accent
        />
        <StatCard
          icon={Clock}
          label="累计阅读"
          value={formatReadTime(readTime as number)}
          loading={overallLoading}
        />
        <StatCard
          icon={Calendar}
          label="阅读天数"
          value={`${readDays} 天`}
          loading={overallLoading}
        />
        <StatCard
          icon={Bookmark}
          label="笔记划线"
          value={`${noteCount} 条`}
          loading={notebooksLoading}
        />
      </div>

      {/* Recent Reading */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{"最近阅读"}</h2>
          <Link 
            href="/shelf" 
            className="group flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {"查看全部"}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {shelfLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                <Skeleton className="aspect-[3/4] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : recentBooks.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recentBooks.slice(0, 6).map((book: Record<string, unknown>, i: number) => {
              const bookInfo = (book.bookInfo || book) as Record<string, unknown>
              const title = (bookInfo.title || '未知书名') as string
              const author = (bookInfo.author || '未知作者') as string
              const cover = (bookInfo.cover || bookInfo.coverUrl || '') as string
              const bookId = (bookInfo.bookId || '') as string

              return (
                <Link
                  key={bookId || i}
                  href={bookId ? `/book/${bookId}` : '#'}
                  className="group flex flex-col gap-2.5"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-sm ring-1 ring-border/50 transition-all group-hover:shadow-lg group-hover:ring-border">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 px-0.5">
                    <span className="text-[13px] font-medium text-foreground line-clamp-2 leading-snug">
                      {title}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {author}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[13px] text-muted-foreground">{"暂无阅读记录"}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reading Progress */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{"阅读进度"}</h2>
          <Link 
            href="/shelf" 
            className="group flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {"查看全部"}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {(shelfLoading || progressLoading) && booksWithProgress.length === 0 ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="flex gap-4 p-4">
                  <Skeleton className="h-16 w-12 shrink-0 rounded-md" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-1.5 w-full rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : booksWithProgress.length > 0 ? (
          <div className="flex flex-col gap-2">
            {booksWithProgress.slice(0, 5).map((bp, i) => {
              const title = (bp.bookInfo.title || '未知书名') as string
              const author = (bp.bookInfo.author || '') as string
              const cover = (bp.bookInfo.cover || '') as string
              const bookId = (bp.bookInfo.bookId || '') as string

              return (
                <Link key={bookId || i} href={bookId ? `/book/${bookId}` : '#'}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="flex gap-4 p-4">
                      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-muted">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-medium text-foreground truncate pr-2">{title}</span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs text-muted-foreground truncate">{author}</span>
                        <div className="flex items-center gap-3 mt-1">
                          <Progress value={bp.progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium text-foreground shrink-0">{`${bp.progress}%`}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
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
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[13px] text-muted-foreground">{"暂无阅读进度数据"}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
