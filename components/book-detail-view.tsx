'use client'

import { useBookInfo, useBookmarklist, useReviewListMine, useBookProgress, useReviewList } from '@/hooks/use-weread'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, BookOpen, Copy, Check, ExternalLink, MessageSquare, Pencil, Star, Users, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { buildBookDeepLink, buildPositionDeepLink, buildReviewDeepLink } from '@/lib/weread-deep-links'

const REVIEW_TYPES = [
  { value: 0, label: '全部' },
  { value: 1, label: '推荐' },
  { value: 4, label: '一般' },
  { value: 2, label: '不行' },
  { value: 3, label: '最新' },
] as const

function formatStars(star: number): string {
  const count = Math.round(star / 20)
  return Array(count).fill('\u2605').join('')
}

function formatTime(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function BookDetailView({ bookId }: { bookId: string }) {
  const { data: bookData, isLoading: bookLoading } = useBookInfo(bookId)
  const { data: bookmarkData, isLoading: bmLoading } = useBookmarklist(bookId)
  const { data: reviewMineData, isLoading: rvMineLoading } = useReviewListMine(bookId)
  const { data: progressData } = useBookProgress(bookId)

  const [reviewType, setReviewType] = useState(0)
  const { data: publicReviewData, isLoading: publicRvLoading } = useReviewList(bookId, reviewType)

  const info = bookData || {}
  const title = (info.title || '加载中...') as string
  const author = (info.author || '') as string
  const cover = (info.cover || '') as string
  const intro = (info.intro || '') as string
  const category = (info.category || '') as string
  const publisher = (info.publisher || '') as string
  const bookDeepLink = buildBookDeepLink(bookId)
  const rating = info.newRating ? Math.round((info.newRating as number) / 10) / 10 : null
  const ratingCount = (info.newRatingCount || 0) as number

  const progress = progressData?.book?.progress as number | undefined
  const progressTime = progressData?.book?.recordReadingTime as number | undefined

  // Highlights from /book/bookmarklist
  const highlights = (bookmarkData?.updated || []) as Record<string, unknown>[]
  const chapters = (bookmarkData?.chapters || []) as Record<string, unknown>[]
  const chapterMap = new Map<number, string>()
  chapters.forEach((ch) => {
    chapterMap.set(ch.chapterUid as number, ch.title as string)
  })

  // Personal reviews from /review/list/mine
  const myReviews = (reviewMineData?.reviews || []) as Record<string, unknown>[]

  // Public reviews from /review/list per review.md
  const publicReviews = (publicReviewData?.reviews || []) as Record<string, unknown>[]
  const reviewsCnt = (publicReviewData?.reviewsCnt || 0) as number
  const deepVInfo = publicReviewData?.deepVRecommendInfo as Record<string, unknown> | undefined
  const deepVValue = publicReviewData?.deepVRecommendValue as number | undefined

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
            <Image src={cover} alt={title} fill className="object-cover" unoptimized />
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
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance md:text-3xl">{title}</h1>
              <p className="text-base text-muted-foreground">{author}</p>

              <div className="flex flex-wrap gap-2">
                {category && <Badge variant="secondary">{category}</Badge>}
                {publisher && <Badge variant="outline">{publisher}</Badge>}
                {rating !== null && (
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3 text-chart-4 fill-chart-4" />
                    {`${rating} 分 (${ratingCount} 人评)`}
                  </Badge>
                )}
              </div>

              {progress !== undefined && (
                <div className="flex items-center gap-3">
                  <Progress value={progress} className="h-2 flex-1 max-w-48" />
                  <span className="text-sm text-muted-foreground">{`${progress}%`}</span>
                  {progressTime && progressTime > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {`${Math.floor(progressTime / 3600)}h${Math.floor((progressTime % 3600) / 60)}m`}
                    </span>
                  )}
                </div>
              )}

              {intro && (
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-4">{intro}</p>
              )}

              {bookDeepLink && (
                <Button variant="outline" size="sm" className="mt-2 w-fit" asChild>
                  <a href={bookDeepLink} target="_blank" rel="noopener noreferrer" aria-label="在微信读书中打开这本书" title="在微信读书中打开这本书">
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    {"在微信读书中打开"}
                  </a>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Highlights */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Pencil className="h-4 w-4" />
          {`划线 (${highlights.length})`}
        </h2>

        {bmLoading ? (
          <LoadingSkeleton count={3} />
        ) : highlights.length > 0 ? (
          <div className="flex flex-col gap-3">
            {highlights.map((hl, i) => (
              <HighlightCard
                key={i}
                text={(hl.markText || '') as string}
                chapter={chapterMap.get(hl.chapterUid as number) || ''}
                bookId={bookId}
                chapterUid={hl.chapterUid as number}
                range={(hl.range || '') as string}
                userVid={hl.userVid as string | number | undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState text="暂无划线" />
        )}
      </section>

      {/* Personal thoughts */}
      {myReviews.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <MessageSquare className="h-4 w-4" />
            {`我的想法 (${myReviews.length})`}
          </h2>
          <div className="flex flex-col gap-3">
            {myReviews.map((rv, i) => {
              const review = (rv.review || rv) as Record<string, unknown>
              const content = (review.content || '') as string
              const chapterName = (review.chapterName || '') as string
              const abstract = (review.abstract || '') as string
              const reviewId = review.reviewId as string | number | undefined
              const chapterUid = review.chapterUid as string | number | undefined
              return (
                <ThoughtCard
                  key={i}
                  content={content}
                  chapter={chapterName}
                  abstract={abstract}
                  bookId={bookId}
                  reviewId={reviewId}
                  chapterUid={chapterUid}
                  range={review.range}
                  userVid={review.userVid as string | number | undefined}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* Public reviews per review.md */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Users className="h-4 w-4" />
          {`书友点评 (${reviewsCnt})`}
        </h2>

        {/* Deep-V recommendation info */}
        {deepVInfo && (
          <Card className="mb-4 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-foreground">{deepVInfo.title as string}</p>
              {deepVInfo.subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">{deepVInfo.subtitle as string}</p>
              )}
              {deepVValue !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={deepVValue / 10} className="h-1.5 flex-1 max-w-48" />
                  <span className="text-xs font-medium text-primary">{`${(deepVValue / 10).toFixed(1)}%`}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Review type filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {REVIEW_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setReviewType(t.value)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                reviewType === t.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {publicRvLoading ? (
          <LoadingSkeleton count={3} />
        ) : publicReviews.length > 0 ? (
          <div className="flex flex-col gap-3">
            {publicReviews.map((item, i) => {
              const rv = (item.review || {}) as Record<string, unknown>
              const rvInner = (rv.review || rv) as Record<string, unknown>
              const content = (rvInner.content || '') as string
              const htmlContent = (rvInner.htmlContent || '') as string
              const star = (rvInner.star || 0) as number
              const createTime = (rvInner.createTime || 0) as number
              const isFinish = rvInner.isFinish as number | undefined
              const chapterName = (rvInner.chapterName || '') as string
              const reviewId = rvInner.reviewId as string | number | undefined
              const authorInfo = (rvInner.author || {}) as Record<string, unknown>
              const authorName = (authorInfo.name || '匿名') as string
              const authorAvatar = (authorInfo.avatar || '') as string
              const reviewDeepLink = buildReviewDeepLink(reviewId)

              return (
                <Card key={i} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {authorAvatar && (
                        <Image
                          src={authorAvatar}
                          alt={authorName}
                          width={28}
                          height={28}
                          className="rounded-full"
                          unoptimized
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{authorName}</span>
                        <div className="flex items-center gap-2">
                          {star > 0 && (
                            <span className="text-xs text-chart-4">{formatStars(star)}</span>
                          )}
                          {isFinish === 1 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">{"读完"}</Badge>
                          )}
                          {createTime > 0 && (
                            <span className="text-xs text-muted-foreground">{formatTime(createTime)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {chapterName && (
                      <p className="mb-2 text-xs text-muted-foreground">{`章节: ${chapterName}`}</p>
                    )}

                    <ReviewContent content={content} htmlContent={htmlContent} />
                    {reviewDeepLink && (
                      <a
                        href={reviewDeepLink}
                        className="mt-2 inline-flex w-fit items-center gap-1 text-xs text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="在微信读书中打开这条书友点评"
                        title="在微信读书中打开这条书友点评"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {"在微信读书中打开"}
                      </a>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState text="暂无点评" />
        )}
      </section>
    </div>
  )
}

function ReviewContent({ content, htmlContent }: { content: string; htmlContent: string }) {
  const [expanded, setExpanded] = useState(false)
  const text = content || ''
  const isLong = text.length > 200

  return (
    <div>
      <p className={`text-sm leading-relaxed text-foreground ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
        {text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs text-primary hover:underline"
        >
          {expanded ? '收起' : '展开全文'}
        </button>
      )}
    </div>
  )
}

function HighlightCard({
  text, chapter, bookId, chapterUid, range, userVid,
}: {
  text: string; chapter: string; bookId: string; chapterUid?: string | number; range: unknown; userVid?: string | number
}) {
  const [copied, setCopied] = useState(false)
  const deepLink = buildPositionDeepLink({ bookId, chapterUid, range, userVid })

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
            {chapter && <span className="text-xs text-muted-foreground">{chapter}</span>}
            {deepLink && (
              <a
                href={deepLink}
                className="text-xs text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="在微信读书中打开这条划线"
                title="在微信读书中打开这条划线"
                onClick={(event) => event.stopPropagation()}
              >
                {"在微信读书中查看"}
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
          {copied ? <Check className="h-3.5 w-3.5 text-chart-2" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
        </Button>
      </CardContent>
    </Card>
  )
}

function ThoughtCard({
  content,
  chapter,
  abstract,
  bookId,
  reviewId,
  chapterUid,
  range,
  userVid,
}: {
  content: string
  chapter: string
  abstract: string
  bookId: string
  reviewId?: string | number
  chapterUid?: string | number
  range: unknown
  userVid?: string | number
}) {
  const [copied, setCopied] = useState(false)
  const deepLink = buildReviewDeepLink(reviewId) || buildPositionDeepLink({ bookId, chapterUid, range, userVid })

  function handleCopy() {
    const t = abstract ? `${abstract}\n---\n${content}` : content
    navigator.clipboard.writeText(t)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="group border-border">
      <CardContent className="flex flex-col gap-2 p-4">
        {abstract && (
          <p className="text-xs leading-relaxed text-muted-foreground italic border-l-2 border-primary/30 pl-3">{abstract}</p>
        )}
        <div className="flex items-start gap-3">
          <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-2" />
          <p className="flex-1 text-sm leading-relaxed text-foreground">{content}</p>
          <Button
            variant="ghost" size="sm"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-chart-2" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
        </div>
        {(chapter || deepLink) && (
          <div className="ml-4 flex items-center gap-2">
            {chapter && <span className="text-xs text-muted-foreground">{chapter}</span>}
            {deepLink && (
              <a
                href={deepLink}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={reviewId ? '在微信读书中打开这条想法' : '在微信读书中打开这条想法所在位置'}
                title={reviewId ? '在微信读书中打开这条想法' : '在微信读书中打开这条想法所在位置'}
                onClick={(event) => event.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                {"在微信读书中打开"}
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border">
          <CardContent className="p-4">
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  )
}
