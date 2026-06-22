'use client'

import { useNotebooks, useBookmarklist, useReviewListMine } from '@/hooks/use-weread'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Highlighter, BookOpen, Copy, Check, ChevronDown, ChevronUp, MessageSquare, Pencil, Bookmark } from 'lucide-react'
import { useState } from 'react'

export function NotesView() {
  const { data, isLoading } = useNotebooks()

  const notebooks = data?.books || []
  const allNotebooks = Array.isArray(notebooks) ? notebooks : []
  const totalNoteCount = (data?.totalNoteCount || 0) as number
  const totalBookCount = (data?.totalBookCount || 0) as number

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {"笔记与划线"}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          {isLoading
            ? '加载中...'
            : `共 ${totalBookCount} 本书，${totalNoteCount} 条笔记`}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-5">
                <Skeleton className="mb-3 h-5 w-48" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : allNotebooks.length === 0 ? (
        <Card className="border shadow-sm bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Highlighter className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-[15px] text-muted-foreground">{"暂无笔记，阅读时划线或写想法会自动同步到这里"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {allNotebooks.map((notebook: Record<string, unknown>, i: number) => (
            <NotebookCard key={i} notebook={notebook} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotebookCard({ notebook }: { notebook: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false)

  const bookInfo = (notebook.book || {}) as Record<string, unknown>
  const title = (bookInfo.title || '未知书名') as string
  const author = (bookInfo.author || '未知作者') as string
  const cover = (bookInfo.cover || '') as string
  const bookId = (notebook.bookId || bookInfo.bookId || '') as string

  const noteCount = (notebook.noteCount || 0) as number
  const reviewCount = (notebook.reviewCount || 0) as number
  const bookmarkCount = (notebook.bookmarkCount || 0) as number
  const totalNotes = reviewCount + noteCount + bookmarkCount
  const progress = (notebook.readingProgress || 0) as number

  return (
    <Card className="border shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <button
          className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
          onClick={() => setExpanded(!expanded)}
        >
          {cover ? (
            <img
              src={cover}
              alt={title}
              className="h-14 w-10 shrink-0 rounded-md object-cover shadow-sm ring-1 ring-border/50"
            />
          ) : (
            <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-muted ring-1 ring-border/50">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <span className="text-[13px] font-semibold text-foreground truncate">{title}</span>
            <span className="text-xs text-muted-foreground">{author}</span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Pencil className="h-3 w-3" />
                {`${noteCount}`}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {`${reviewCount}`}
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                {`${bookmarkCount}`}
              </span>
              {progress > 0 && (
                <span className="text-primary">{`${progress}%`}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="h-6 min-w-[28px] justify-center text-xs font-medium">{totalNotes}</Badge>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {expanded && bookId && (
          <NotebookContent bookId={bookId} />
        )}
      </CardContent>
    </Card>
  )
}

function NotebookContent({ bookId }: { bookId: string }) {
  const { data: bookmarkData, isLoading: bmLoading } = useBookmarklist(bookId)
  const { data: reviewData, isLoading: rvLoading } = useReviewListMine(bookId)

  const isLoading = bmLoading || rvLoading

  const highlights = (bookmarkData?.updated || []) as Record<string, unknown>[]
  const chapters = (bookmarkData?.chapters || []) as Record<string, unknown>[]
  const chapterMap = new Map<number, string>()
  chapters.forEach((ch) => {
    chapterMap.set(ch.chapterUid as number, ch.title as string)
  })

  const reviews = (reviewData?.reviews || []) as Record<string, unknown>[]

  if (isLoading) {
    return (
      <div className="border-t border-border px-5 py-4 bg-muted/20">
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  if (highlights.length === 0 && reviews.length === 0) {
    return (
      <div className="border-t border-border px-5 py-6 text-center text-[13px] text-muted-foreground bg-muted/20">
        {"暂无可导出的笔记内容（书签仅统计数量，不导出内容）"}
      </div>
    )
  }

  return (
    <div className="border-t border-border bg-muted/20">
      {highlights.length > 0 && (
        <div className="flex flex-col divide-y divide-border/50">
          {highlights.map((hl, j) => {
            const text = (hl.markText || '') as string
            const chUid = hl.chapterUid as number
            const chapterName = chapterMap.get(chUid) || ''
            return (
              <NoteItem
                key={`hl-${j}`}
                type="highlight"
                text={text}
                chapter={chapterName}
              />
            )
          })}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="flex flex-col divide-y divide-border/50">
          {reviews.map((rv, j) => {
            const review = (rv.review || rv) as Record<string, unknown>
            const content = (review.content || '') as string
            const chapterName = (review.chapterName || '') as string
            const abstract = (review.abstract || '') as string
            return (
              <NoteItem
                key={`rv-${j}`}
                type="thought"
                text={content}
                chapter={chapterName}
                abstract={abstract}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function NoteItem({ type, text, chapter, abstract }: {
  type: 'highlight' | 'thought'
  text: string
  chapter: string
  abstract?: string
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const copyText = abstract ? `${abstract}\n---\n${text}` : text
    navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group flex flex-col gap-2 px-5 py-4">
      {type === 'thought' && abstract && (
        <div className="flex items-start gap-2.5">
          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
          <p className="flex-1 text-xs leading-relaxed text-muted-foreground italic">
            {abstract}
          </p>
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <div
          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
            type === 'highlight' ? 'bg-primary' : 'bg-chart-2'
          }`}
        />
        <p className="flex-1 text-[13px] leading-relaxed text-foreground">{text}</p>
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
        <span className="ml-4 text-xs text-muted-foreground/70">{chapter}</span>
      )}
    </div>
  )
}
