'use client'

import { useState, useCallback, useRef } from 'react'
import { useSearch } from '@/hooks/use-weread'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, BookOpen, Star, Users, ChevronDown, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const SCOPE_TABS = [
  { value: 0, label: '全部' },
  { value: 10, label: '电子书' },
  { value: 16, label: '网文小说' },
  { value: 14, label: '听书' },
  { value: 6, label: '作者' },
  { value: 12, label: '全文' },
  { value: 13, label: '书单' },
] as const

function formatRating(rating: number): string {
  return (rating / 10).toFixed(1)
}

export function SearchView() {
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<number>(10)
  const [maxIdx, setMaxIdx] = useState(0)
  const [allResults, setAllResults] = useState<Record<string, unknown>[]>([])
  const [allGroups, setAllGroups] = useState<Record<string, unknown>[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data, isLoading } = useSearch(query, scope, maxIdx)

  const groups = (data?.results || []) as Record<string, unknown>[]
  const hasMore = data?.hasMore === 1

  const currentBooks = scope === 0
    ? []
    : groups.flatMap((g: Record<string, unknown>) => (g.books || []) as Record<string, unknown>[])

  const displayBooks = maxIdx === 0 ? currentBooks : [...allResults, ...currentBooks]
  const displayGroups = maxIdx === 0 ? groups : (scope === 0 ? [...allGroups, ...groups] : [])

  const handleSearch = useCallback((value: string) => {
    setInputValue(value)
    setMaxIdx(0)
    setAllResults([])
    setAllGroups([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setQuery(value)
    }, 500)
  }, [])

  const handleScopeChange = useCallback((newScope: number) => {
    setScope(newScope)
    setMaxIdx(0)
    setAllResults([])
    setAllGroups([])
  }, [])

  function handleLoadMore() {
    if (scope === 0) {
      setAllGroups((prev) => [...prev, ...groups])
    } else {
      setAllResults((prev) => [...prev, ...currentBooks])
    }
    const lastGroup = groups[groups.length - 1] as Record<string, unknown> | undefined
    if (lastGroup) {
      const books = (lastGroup.books || []) as Record<string, unknown>[]
      const lastBook = books[books.length - 1]
      if (lastBook && typeof lastBook.searchIdx === 'number') {
        setMaxIdx(lastBook.searchIdx)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {"搜索"}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">{"搜索书籍、作者或内容"}</p>
      </div>

      {/* Search input */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="输入书名、作者或关键词..."
          value={inputValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-11 bg-card border shadow-sm text-[15px] placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Scope tabs */}
      <div className="flex flex-wrap gap-1.5">
        {SCOPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleScopeChange(tab.value)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all ${
              scope === tab.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {query && isLoading && maxIdx === 0 && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="flex gap-4 p-4">
                <Skeleton className="h-24 w-[68px] shrink-0 rounded-lg" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No results */}
      {query && !isLoading && groups.length === 0 && maxIdx === 0 && (
        <Card className="border shadow-sm bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-[15px] text-muted-foreground">{`未找到「${query}」相关结果`}</p>
          </CardContent>
        </Card>
      )}

      {/* Grouped results (scope=0) */}
      {scope === 0 && (displayGroups.length > 0 || groups.length > 0) && (
        <div className="flex flex-col gap-8">
          {(maxIdx === 0 ? groups : displayGroups).map((group: Record<string, unknown>, gi: number) => {
            const groupTitle = (group.title || '结果') as string
            const groupBooks = (group.books || []) as Record<string, unknown>[]
            const scopeCount = (group.scopeCount || 0) as number

            if (groupBooks.length === 0) return null

            return (
              <div key={gi}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold text-foreground">{groupTitle}</h2>
                  {scopeCount > 0 && (
                    <span className="text-xs text-muted-foreground">{`共 ${scopeCount} 个`}</span>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {groupBooks.map((item: Record<string, unknown>, i: number) => (
                    <BookResultCard key={i} item={item} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Flat list (scope>0) */}
      {scope !== 0 && displayBooks.length > 0 && (
        <div className="flex flex-col gap-3">
          {displayBooks.map((item: Record<string, unknown>, i: number) => (
            <BookResultCard key={i} item={item} />
          ))}
        </div>
      )}

      {/* Load more */}
      {query && hasMore && !isLoading && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="gap-2 h-10 px-5 border shadow-sm bg-card hover:bg-muted"
            disabled={isLoading}
          >
            <ChevronDown className="h-4 w-4" />
            {"加载更多"}
          </Button>
        </div>
      )}
      {query && isLoading && maxIdx > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
            <BookOpen className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <p className="text-[15px] text-muted-foreground">{"输入关键词开始搜索"}</p>
        </div>
      )}
    </div>
  )
}

function BookResultCard({ item }: { item: Record<string, unknown> }) {
  const bookInfo = (item.bookInfo || item) as Record<string, unknown>
  const title = (bookInfo.title || '未知书名') as string
  const author = (bookInfo.author || '') as string
  const cover = (bookInfo.cover || '') as string
  const bookId = (bookInfo.bookId || '') as string
  const intro = (bookInfo.intro || '') as string
  const category = (bookInfo.category || '') as string
  const soldout = bookInfo.soldout === 1

  const rating = item.newRating as number | undefined
  const ratingCount = (item.newRatingCount || 0) as number
  const readingCount = (item.readingCount || 0) as number
  const ratingLabel = (item.newRatingDetail as Record<string, unknown>)?.title as string | undefined

  return (
    <Link href={bookId ? `/book/${bookId}` : '#'}>
      <Card className={`border shadow-sm transition-all hover:shadow-md cursor-pointer ${soldout ? 'opacity-60' : ''}`}>
        <CardContent className="flex gap-4 p-4">
          <div className="relative h-24 w-[68px] shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm ring-1 ring-border/50">
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
                <BookOpen className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-foreground truncate">{title}</span>
              {soldout && <Badge variant="destructive" className="text-[10px] shrink-0 px-1.5 py-0 h-4">{"已下架"}</Badge>}
            </div>
            <span className="text-xs text-muted-foreground">{author}</span>

            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {rating && rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-chart-4 fill-chart-4" />
                  <span className="text-xs font-medium text-foreground">{formatRating(rating)}</span>
                  {ratingLabel && (
                    <span className="text-[11px] text-muted-foreground">{ratingLabel}</span>
                  )}
                  {ratingCount > 0 && (
                    <span className="text-[11px] text-muted-foreground">{`(${ratingCount})`}</span>
                  )}
                </div>
              )}
              {readingCount > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{`${readingCount} 人在读`}</span>
                </div>
              )}
              {category && (
                <Badge variant="secondary" className="text-[11px] px-2 py-0 h-5">{category}</Badge>
              )}
            </div>

            {intro && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {intro}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
