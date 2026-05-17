'use client'

import { useNotebooks } from '@/hooks/use-weread'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Highlighter, BookOpen, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function NotesView() {
  const { data, isLoading } = useNotebooks()

  const notebooks = data?.books || data?.notebooks || []
  const allNotebooks = Array.isArray(notebooks) ? notebooks : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {"笔记与划线"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {`来自 ${allNotebooks.length} 本书的阅读笔记`}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6">
                <Skeleton className="mb-3 h-5 w-48" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : allNotebooks.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Highlighter className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">{"暂无笔记，阅读时划线或写想法会自动同步到这里"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {allNotebooks.map((notebook: Record<string, unknown>, i: number) => (
            <NotebookCard key={i} notebook={notebook} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotebookCard({ notebook }: { notebook: Record<string, unknown> }) {
  const bookInfo = (notebook.book || notebook.bookInfo || notebook) as Record<string, unknown>
  const title = (bookInfo.title || '未知书名') as string
  const author = (bookInfo.author || '未知作者') as string
  const bookmarks = (notebook.bookmarks || notebook.highlights || []) as Record<string, unknown>[]
  const reviews = (notebook.reviews || notebook.thoughts || []) as Record<string, unknown>[]

  const allItems = [
    ...bookmarks.map((b) => ({
      type: 'highlight' as const,
      text: (b.markText || b.text || '') as string,
      chapter: (b.chapterName || b.chapter || '') as string,
    })),
    ...reviews.map((r) => ({
      type: 'thought' as const,
      text: (r.content || r.text || '') as string,
      chapter: (r.chapterName || r.chapter || '') as string,
    })),
  ].filter((item) => item.text)

  const [expanded, setExpanded] = useState(false)
  const displayItems = expanded ? allItems : allItems.slice(0, 3)

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-6 py-4">
          <BookOpen className="h-4 w-4 shrink-0 text-primary" />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">{title}</span>
            <span className="text-xs text-muted-foreground">{author}</span>
          </div>
          <Badge variant="secondary" className="ml-auto shrink-0">
            {allItems.length} {"条"}
          </Badge>
        </div>

        {allItems.length > 0 && (
          <div className="flex flex-col divide-y divide-border">
            {displayItems.map((item, j) => (
              <NoteItem key={j} item={item} />
            ))}
          </div>
        )}

        {allItems.length > 3 && (
          <div className="px-6 py-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '收起' : `查看全部 ${allItems.length} 条`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function NoteItem({ item }: { item: { type: 'highlight' | 'thought'; text: string; chapter: string } }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(item.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group flex flex-col gap-2 px-6 py-4">
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 h-1 w-1 shrink-0 rounded-full ${
            item.type === 'highlight' ? 'bg-primary' : 'bg-chart-2'
          }`}
        />
        <p className="flex-1 text-sm leading-relaxed text-foreground">{item.text}</p>
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
      {item.chapter && (
        <span className="ml-4 text-xs text-muted-foreground">{item.chapter}</span>
      )}
    </div>
  )
}
