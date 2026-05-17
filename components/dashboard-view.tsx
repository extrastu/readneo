'use client'

import { useShelf, useReadStat } from '@/hooks/use-weread'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Clock, Bookmark, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

function StatCard({
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

function formatReadTime(seconds: number): string {
  if (!seconds) return '0 分钟'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`
  }
  return `${minutes} 分钟`
}

export function DashboardView() {
  const { data: shelfData, isLoading: shelfLoading } = useShelf()
  const { data: statData, isLoading: statLoading } = useReadStat()

  const books = shelfData?.books || []
  const albums = shelfData?.albums || []
  const allItems = [...(Array.isArray(books) ? books : []), ...(Array.isArray(albums) ? albums : [])]
  const recentBooks = allItems.slice(0, 8)
  const totalBooks = allItems.length + (shelfData?.mp ? 1 : 0)

  const readTime = statData?.readTime || statData?.totalReadTime || 0
  const noteCount = statData?.noteCount || statData?.totalNotes || 0
  const bookCount = statData?.bookCount || statData?.finishedBookCount || totalBooks

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {"阅读概览"}
        </h1>
        <p className="mt-1 text-muted-foreground">{"管理你的阅读数据与书摘笔记"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="书架藏书"
          value={`${bookCount}`}
          loading={shelfLoading && statLoading}
        />
        <StatCard
          icon={Clock}
          label="阅读时长"
          value={formatReadTime(readTime)}
          loading={statLoading}
        />
        <StatCard
          icon={Bookmark}
          label="笔记数量"
          value={`${noteCount}`}
          loading={statLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="最近阅读"
          value={`${recentBooks.length} 本`}
          loading={shelfLoading}
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{"最近阅读"}</h2>
          <Link href="/shelf" className="text-sm text-primary hover:underline">
            {"查看全部"}
          </Link>
        </div>

        {shelfLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : recentBooks.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {recentBooks.map((book: Record<string, unknown>, i: number) => {
              const bookInfo = (book.bookInfo || book) as Record<string, unknown>
              const title = (bookInfo.title || '未知书名') as string
              const author = (bookInfo.author || '未知作者') as string
              const cover = (bookInfo.cover || bookInfo.coverUrl || '') as string
              const bookId = (bookInfo.bookId || '') as string

              return (
                <Link
                  key={bookId || i}
                  href={bookId ? `/book/${bookId}` : '#'}
                  className="group flex flex-col gap-3"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-sm transition-shadow group-hover:shadow-md">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-accent">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground line-clamp-2 text-pretty">
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
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">{"书架为空，快去微信读书添加一些书吧"}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
