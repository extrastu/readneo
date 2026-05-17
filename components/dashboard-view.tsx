'use client'

import { useShelf, useReadDetailOverall, useNotebooks } from '@/hooks/use-weread'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Clock, Bookmark, TrendingUp, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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

export function DashboardView() {
  const { data: shelfData, isLoading: shelfLoading } = useShelf()
  const { data: overallData, isLoading: overallLoading } = useReadDetailOverall()
  const { data: notebooksData, isLoading: notebooksLoading } = useNotebooks()

  const books = shelfData?.books || []
  const albums = shelfData?.albums || []
  const allItems = [...(Array.isArray(books) ? books : []), ...(Array.isArray(albums) ? albums : [])]
  const recentBooks = allItems.slice(0, 8)
  const totalBooks = allItems.length + (shelfData?.mp ? 1 : 0)

  const readTime = (overallData?.totalReadTime || 0) as number
  const noteCount = (notebooksData?.totalNoteCount || 0) as number

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
          icon={Bookmark}
          label="笔记划线"
          value={`${noteCount} 条`}
          loading={notebooksLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="最近在读"
          value={`${recentBooks.length} 本`}
          loading={shelfLoading}
        />
      </div>

      {/* Recent books */}
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2.5">
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
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[15px] text-muted-foreground">{"书架为空，快去微信读书添加一些书吧"}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
