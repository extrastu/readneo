'use client'

import { useState } from 'react'
import { useSearch } from '@/hooks/use-weread'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function SearchView() {
  const [query, setQuery] = useState('')
  const { data, isLoading } = useSearch(query)

  const results = data?.books || data?.results || []
  const allResults = Array.isArray(results) ? results : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {"搜索"}
        </h1>
        <p className="mt-1 text-muted-foreground">{"搜索书籍、作者或内容"}</p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="输入书名、作者或关键词..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 bg-card border-border"
        />
      </div>

      {query && isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="flex gap-4 p-4">
                <Skeleton className="h-24 w-18 shrink-0 rounded-md" />
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

      {query && !isLoading && allResults.length === 0 && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">{`未找到「${query}」相关结果`}</p>
          </CardContent>
        </Card>
      )}

      {allResults.length > 0 && (
        <div className="flex flex-col gap-3">
          {allResults.map((item: Record<string, unknown>, i: number) => {
            const bookInfo = (item.bookInfo || item) as Record<string, unknown>
            const title = (bookInfo.title || '未知书名') as string
            const author = (bookInfo.author || '未知作者') as string
            const cover = (bookInfo.cover || bookInfo.coverUrl || '') as string
            const bookId = (bookInfo.bookId || '') as string
            const intro = (bookInfo.intro || bookInfo.description || '') as string

            return (
              <Link key={bookId || i} href={bookId ? `/book/${bookId}` : '#'}>
                <Card className="border-border hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex gap-4 p-4">
                    <div className="relative h-24 w-18 shrink-0 overflow-hidden rounded-md bg-muted">
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
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {title}
                      </span>
                      <span className="text-xs text-muted-foreground">{author}</span>
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
          })}
        </div>
      )}

      {!query && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">{"输入关键词开始搜索"}</p>
        </div>
      )}
    </div>
  )
}
