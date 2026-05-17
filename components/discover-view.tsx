'use client'

import { useState } from 'react'
import { useRecommend, fetchWeRead } from '@/hooks/use-weread'
import { useWeReadStore } from '@/lib/store'
import { API } from '@/lib/weread'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Star, Users, BookOpen, RefreshCw, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

function formatRating(rating: number): string {
  return (rating / 10).toFixed(1)
}

export function DiscoverView() {
  const { data, isLoading } = useRecommend(0)
  const apiKey = useWeReadStore((s) => s.apiKey)
  const [extraBooks, setExtraBooks] = useState<Record<string, unknown>[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastMaxIdx, setLastMaxIdx] = useState(0)
  const [noMore, setNoMore] = useState(false)

  const initialBooks = (data?.books || []) as Record<string, unknown>[]
  const displayBooks = extraBooks.length > 0 ? extraBooks : initialBooks

  async function handleLoadMore() {
    if (!apiKey || loadingMore) return

    const lastBook = displayBooks[displayBooks.length - 1]
    const nextIdx = (lastBook?.searchIdx as number) || lastMaxIdx + 12

    setLoadingMore(true)
    try {
      const moreData = await fetchWeRead(apiKey, API.BOOK_RECOMMEND, {
        count: 12,
        maxIdx: nextIdx,
      })
      const moreBooks = (moreData?.books || []) as Record<string, unknown>[]
      if (moreBooks.length === 0) {
        setNoMore(true)
      } else {
        // Replace instead of append
        setExtraBooks(moreBooks)
        const last = moreBooks[moreBooks.length - 1]
        setLastMaxIdx((last?.searchIdx as number) || nextIdx + 12)
      }
    } catch (err) {
      console.error('Failed to load more recommendations:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          {"发现"}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">{"基于你的阅读记录，为你推荐好书"}</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2.5">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && displayBooks.length === 0 && (
        <Card className="border-0 shadow-sm bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-[15px] text-muted-foreground">{"暂无推荐，多读几本书就有啦"}</p>
          </CardContent>
        </Card>
      )}

      {displayBooks.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {displayBooks.map((book: Record<string, unknown>, i: number) => (
            <RecommendBookCard key={`${book.bookId}-${i}`} book={book} />
          ))}
        </div>
      )}

      {/* Load more */}
      {!isLoading && displayBooks.length > 0 && !noMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="gap-2 h-10 px-5 border-0 shadow-sm bg-card hover:bg-muted"
          >
            {loadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loadingMore ? '加载中...' : '换一批推荐'}
          </Button>
        </div>
      )}
    </div>
  )
}

function RecommendBookCard({ book }: { book: Record<string, unknown> }) {
  const title = (book.title || '未知书名') as string
  const author = (book.author || '') as string
  const cover = (book.cover || '') as string
  const bookId = (book.bookId || '') as string
  const reason = (book.reason || '') as string
  const category = (book.category || '') as string
  const rating = book.newRating as number | undefined
  const ratingLabel = (book.newRatingDetail as Record<string, unknown>)?.title as string | undefined
  const readingCount = (book.readingCount || 0) as number

  return (
    <Link
      href={bookId ? `/book/${bookId}` : '#'}
      className="group flex flex-col gap-2.5"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-sm ring-1 ring-border/50 transition-all duration-200 group-hover:shadow-lg group-hover:ring-border group-hover:-translate-y-0.5">
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
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        {/* Rating overlay */}
        {rating && rating > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-8">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[11px] font-medium text-white">{formatRating(rating)}</span>
              {ratingLabel && (
                <span className="text-[11px] text-white/80">{ratingLabel}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-0.5">
        <span className="text-[13px] font-medium text-foreground line-clamp-2 leading-snug">
          {title}
        </span>
        <span className="text-xs text-muted-foreground line-clamp-1">{author}</span>

        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {readingCount > 0 && (
            <div className="flex items-center gap-0.5">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{readingCount}</span>
            </div>
          )}
          {category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{category}</Badge>
          )}
        </div>

        {reason && (
          <p className="mt-1 text-[11px] text-primary/80 line-clamp-2 leading-relaxed">
            {reason}
          </p>
        )}
      </div>
    </Link>
  )
}
