'use client'

import { useBookInfo, useBookmarklist, useReviewListMine, useBookProgress } from '@/hooks/use-weread'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Copy, Check, ExternalLink, MessageSquare, Pencil } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export function BookDetailView({ bookId }: { bookId: string }) {
  const { data: bookData, isLoading: bookLoading } = useBookInfo(bookId)
  const { data: bookmarkData, isLoading: bmLoading } = useBookmarklist(bookId)
  const { data: reviewData, isLoading: rvLoading } = useReviewListMine(bookId)
  const { data: progressData } = useBookProgress(bookId)

  const info = bookData || {}
  const title = (info.title || '加载中...') as string
  const author = (info.author || '') as string
  const cover = (info.cover || '') as string
  const intro = (info.intro || '') as string
  const category = (info.category || '') as string
  const publisher = (info.publisher || '') as string
  const rating = info.newRating ? Math.round((info.newRating as number) / 10) / 10 : null
  const ratingCount = (info.newRatingCount || 0) as number

  // Per book.md: /book/getprogress returns book.progress (0-100)
  const progress = progressData?.book?.progress as number | undefined
  const progressTime = progressData?.book?.recordReadingTime as number | undefined

  // Per notes.md: /book/bookmarklist returns updated[] with markText
  const highlights = (bookmarkData?.updated || []) as Record<string, unknown>[]
  // Build chapter map from chapters array
  const chapters = (bookmarkData?.chapters || []) as Record<string, unknown>[]
  const chapterMap = new Map<number, string>()
  chapters.forEach((ch) => {
    chapterMap.set(ch.chapterUid as number, ch.title as string)
  })

  // Per notes.md: /review/list/mine returns reviews[] with review.content
  const reviews = (reviewData?.reviews || []) as Record<string, unknown>[]

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
                {rating !== null && (
                  <Badge variant="outline">{`${rating} 分 (${ratingCount} 人评)`}</Badge>
                )}
              </div>

              {/* Progress info per book.md */}
              {progress !== undefined && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{`阅读进度: ${progress}%`}</span>
                  {progressTime && progressTime > 0 && (
                    <span>{`累计 ${Math.floor(progressTime / 3600)}h${Math.floor((progressTime % 3600) / 60)}m`}</span>
                  )}
                </div>
              )}

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

      {/* Highlights (划线) */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Pencil className="h-4 w-4" />
          {`划线 (${highlights.length})`}
        </h2>

        {bmLoading ? (
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
        ) : highlights.length > 0 ? (
          <div className="flex flex-col gap-3">
            {highlights.map((hl: Record<string, unknown>, i: number) => {
              const text = (hl.markText || '') as string
              const chUid = hl.chapterUid as number
              const chapterName = chapterMap.get(chUid) || ''
              const range = (hl.range || '') as string

              return (
                <HighlightCard
                  key={i}
                  text={text}
                  chapter={chapterName}
                  bookId={bookId}
                  chapterUid={chUid}
                  range={range}
                />
              )
            })}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">{"暂无划线"}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Thoughts / reviews (想法/点评) */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <MessageSquare className="h-4 w-4" />
          {`想法与点评 (${reviews.length})`}
        </h2>

        {rvLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reviews.map((rv: Record<string, unknown>, i: number) => {
              const review = (rv.review || rv) as Record<string, unknown>
              const content = (review.content || '') as string
              const chapterName = (review.chapterName || '') as string
              const abstract = (review.abstract || '') as string

              return (
                <ThoughtCard
                  key={i}
                  content={content}
                  chapter={chapterName}
                  abstract={abstract}
                />
              )
            })}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">{"暂无想法或点评"}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function HighlightCard({
  text,
  chapter,
  bookId,
  chapterUid,
  range,
}: {
  text: string
  chapter: string
  bookId: string
  chapterUid?: number
  range: string
}) {
  const [copied, setCopied] = useState(false)

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

function ThoughtCard({
  content,
  chapter,
  abstract,
}: {
  content: string
  chapter: string
  abstract: string
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const copyText = abstract ? `${abstract}\n---\n${content}` : content
    navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="group border-border">
      <CardContent className="flex flex-col gap-2 p-4">
        {abstract && (
          <p className="text-xs leading-relaxed text-muted-foreground italic border-l-2 border-primary/30 pl-3">
            {abstract}
          </p>
        )}
        <div className="flex items-start gap-3">
          <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-2" />
          <p className="flex-1 text-sm leading-relaxed text-foreground">{content}</p>
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
        </div>
        {chapter && (
          <span className="ml-4 text-xs text-muted-foreground">{chapter}</span>
        )}
      </CardContent>
    </Card>
  )
}
