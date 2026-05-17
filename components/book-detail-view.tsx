'use client'

import { useBookInfo, useBookmarks } from '@/hooks/use-weread'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Copy, Check, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export function BookDetailView({ bookId }: { bookId: string }) {
  const { data: bookData, isLoading: bookLoading } = useBookInfo(bookId)
  const { data: bookmarksData, isLoading: bookmarksLoading } = useBookmarks(bookId)

  const info = bookData?.bookInfo || bookData || {}
  const title = (info.title || '加载中...') as string
  const author = (info.author || '') as string
  const cover = (info.cover || info.coverUrl || '') as string
  const intro = (info.intro || info.description || '') as string
  const category = (info.category || info.categoryName || '') as string
  const publisher = (info.publisher || info.publisherName || '') as string

  const bookmarks = bookmarksData?.bookmarks || bookmarksData?.highlights || []
  const allBookmarks = Array.isArray(bookmarks) ? bookmarks : []

  return (
    <div className="flex flex-col gap-6">
      <Link href="/shelf" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" />
        {"返回书架"}
      </Link>

      {/* Book header */}
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative h-56 w-40 shrink-0 self-center overflow-hidden rounded-xl bg-muted shadow-md sm:self-start">
          {bookLoading ? (
            <Skeleton className="h-full w-full" />
          ) : cover ? (
            <Image
              src={cover}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-accent">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {bookLoading ? (
            <>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance md:text-3xl">
                {title}
              </h1>
              <p className="text-base text-muted-foreground">{author}</p>

              <div className="flex flex-wrap gap-2">
                {category && <Badge variant="secondary">{category}</Badge>}
                {publisher && <Badge variant="outline">{publisher}</Badge>}
              </div>

              {intro && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {intro}
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-fit"
                asChild
              >
                <a
                  href={`weread://reading?bId=${bookId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  {"在微信读书中打开"}
                </a>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bookmarks / highlights */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {`划线与笔记 (${allBookmarks.length})`}
        </h2>

        {bookmarksLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : allBookmarks.length > 0 ? (
          <div className="flex flex-col gap-3">
            {allBookmarks.map((bm: Record<string, unknown>, i: number) => (
              <HighlightCard key={i} bookmark={bm} bookId={bookId} />
            ))}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{"暂无划线或笔记"}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function HighlightCard({ bookmark, bookId }: { bookmark: Record<string, unknown>; bookId: string }) {
  const text = (bookmark.markText || bookmark.text || '') as string
  const chapter = (bookmark.chapterName || bookmark.chapter || '') as string
  const chapterUid = bookmark.chapterUid as number | undefined
  const range = (bookmark.range || '') as string
  const [copied, setCopied] = useState(false)

  // Per SKILL spec: generate deep link when chapterUid and range are available
  let deepLink = ''
  if (chapterUid && range && range.includes('-')) {
    const [rangeStart, rangeEnd] = range.split('-')
    deepLink = `weread://bestbookmark?bookId=${bookId}&chapterUid=${chapterUid}&rangeStart=${rangeStart}&rangeEnd=${rangeEnd}`
  }

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="group border-border">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        <div className="flex-1 flex flex-col gap-1.5">
          <p className="text-sm leading-relaxed text-foreground">{text}</p>
          <div className="flex items-center gap-2">
            {chapter && (
              <span className="text-xs text-muted-foreground">{chapter}</span>
            )}
            {deepLink && (
              <a
                href={deepLink}
                className="text-xs text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {"在 App 中查看"}
              </a>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-chart-2" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
