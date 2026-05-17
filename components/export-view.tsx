'use client'

import { useState, useCallback } from 'react'
import { useWeReadStore } from '@/lib/store'
import { fetchWeRead } from '@/hooks/use-weread'
import { useNotebooks } from '@/hooks/use-weread'
import { API } from '@/lib/weread'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileArchive,
  Flower2,
  Database,
  Download,
  RefreshCw,
  Check,
  AlertCircle,
  BookOpen,
  Info,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface ExportProgress {
  total: number
  current: number
  currentBook: string
  status: 'idle' | 'fetching' | 'generating' | 'syncing' | 'done' | 'error'
  message: string
}

// Fetch all highlights + reviews for a single book
async function fetchBookNotes(apiKey: string, bookId: string) {
  const [bmData, rvData] = await Promise.all([
    fetchWeRead(apiKey, API.BOOK_BOOKMARK_LIST, { bookId }),
    fetchWeRead(apiKey, API.REVIEW_LIST_MINE, { bookid: bookId, count: 200 }),
  ])

  const highlights = (bmData?.updated || []) as Record<string, unknown>[]
  const chapters = (bmData?.chapters || []) as Record<string, unknown>[]
  const chapterMap = new Map<number, string>()
  chapters.forEach((ch) => {
    chapterMap.set(ch.chapterUid as number, ch.title as string)
  })

  const reviews = (rvData?.reviews || []) as Record<string, unknown>[]

  return { highlights, reviews, chapterMap }
}

// Format a book's notes into Markdown
function bookToMarkdown(
  bookInfo: Record<string, unknown>,
  highlights: Record<string, unknown>[],
  reviews: Record<string, unknown>[],
  chapterMap: Map<number, string>
): string {
  const title = (bookInfo.title || '未知书名') as string
  const author = (bookInfo.author || '未知作者') as string

  let md = `# ${title}\n\n`
  md += `> ${author}\n\n`

  if (highlights.length > 0) {
    md += `## 划线 (${highlights.length})\n\n`
    // Group by chapter
    const byChapter = new Map<string, string[]>()
    for (const hl of highlights) {
      const chUid = hl.chapterUid as number
      const chapterName = chapterMap.get(chUid) || '未知章节'
      const text = (hl.markText || '') as string
      if (!text) continue
      if (!byChapter.has(chapterName)) byChapter.set(chapterName, [])
      byChapter.get(chapterName)!.push(text)
    }
    for (const [chapter, texts] of byChapter) {
      md += `### ${chapter}\n\n`
      for (const text of texts) {
        md += `> ${text.replace(/\n/g, '\n> ')}\n\n`
      }
    }
  }

  if (reviews.length > 0) {
    md += `## 想法 (${reviews.length})\n\n`
    for (const rv of reviews) {
      const review = (rv.review || rv) as Record<string, unknown>
      const content = (review.content || '') as string
      const abstract = (review.abstract || '') as string
      const chapterName = (review.chapterName || '') as string
      if (!content) continue
      if (abstract) {
        md += `> ${abstract.replace(/\n/g, '\n> ')}\n\n`
      }
      md += `${content}\n`
      if (chapterName) {
        md += `\n*-- ${chapterName}*\n`
      }
      md += '\n---\n\n'
    }
  }

  return md
}

// Sanitize filename
function sanitize(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '_').trim() || 'untitled'
}

export function ExportView() {
  const {
    apiKey,
    flomoApiUrl,
    notionToken,
    notionDatabaseId,
  } = useWeReadStore()
  const { data: notebooksData } = useNotebooks()

  const notebooks = (notebooksData?.books || []) as Record<string, unknown>[]
  const booksWithNotes = notebooks.filter((nb) => {
    const noteCount = (nb.noteCount || 0) as number
    const reviewCount = (nb.reviewCount || 0) as number
    return noteCount > 0 || reviewCount > 0
  })

  const [mdProgress, setMdProgress] = useState<ExportProgress>({
    total: 0, current: 0, currentBook: '', status: 'idle', message: '',
  })
  const [flomoProgress, setFlomoProgress] = useState<ExportProgress>({
    total: 0, current: 0, currentBook: '', status: 'idle', message: '',
  })
  const [notionProgress, setNotionProgress] = useState<ExportProgress>({
    total: 0, current: 0, currentBook: '', status: 'idle', message: '',
  })

  // --- Export as Markdown ZIP ---
  const exportMarkdownZip = useCallback(async () => {
    if (!apiKey || booksWithNotes.length === 0) return
    const total = booksWithNotes.length
    setMdProgress({ total, current: 0, currentBook: '', status: 'fetching', message: '正在获取笔记数据...' })

    try {
      const zip = new JSZip()
      for (let i = 0; i < total; i++) {
        const nb = booksWithNotes[i]
        const bookInfo = (nb.book || {}) as Record<string, unknown>
        const title = (bookInfo.title || '未知书名') as string
        const bookId = (nb.bookId || bookInfo.bookId || '') as string

        setMdProgress((p) => ({
          ...p,
          current: i,
          currentBook: title,
          message: `正在处理：${title} (${i + 1}/${total})`,
        }))

        if (!bookId) continue
        const { highlights, reviews, chapterMap } = await fetchBookNotes(apiKey, bookId)
        if (highlights.length === 0 && reviews.length === 0) continue
        const md = bookToMarkdown(bookInfo, highlights, reviews, chapterMap)
        const filename = `${sanitize(title)}.md`
        zip.file(filename, md)
      }

      setMdProgress((p) => ({ ...p, status: 'generating', message: '正在生成 ZIP 文件...' }))
      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, `readNeo-笔记导出-${new Date().toISOString().slice(0, 10)}.zip`)

      setMdProgress({ total, current: total, currentBook: '', status: 'done', message: `成功导出 ${total} 本书的笔记` })
    } catch (err) {
      setMdProgress((p) => ({
        ...p,
        status: 'error',
        message: `导出失败：${err instanceof Error ? err.message : '未知错误'}`,
      }))
    }
  }, [apiKey, booksWithNotes])

  // --- Sync to Flomo ---
  const syncToFlomo = useCallback(async () => {
    if (!apiKey || !flomoApiUrl || booksWithNotes.length === 0) return
    const total = booksWithNotes.length
    let totalSynced = 0
    setFlomoProgress({ total, current: 0, currentBook: '', status: 'fetching', message: '正在获取笔记数据...' })

    try {
      for (let i = 0; i < total; i++) {
        const nb = booksWithNotes[i]
        const bookInfo = (nb.book || {}) as Record<string, unknown>
        const title = (bookInfo.title || '未知书名') as string
        const bookId = (nb.bookId || bookInfo.bookId || '') as string

        setFlomoProgress((p) => ({
          ...p,
          current: i,
          currentBook: title,
          status: 'syncing',
          message: `正在同步：${title} (${i + 1}/${total})`,
        }))

        if (!bookId) continue
        const { highlights, reviews, chapterMap } = await fetchBookNotes(apiKey, bookId)

        // Sync highlights
        for (const hl of highlights) {
          const text = (hl.markText || '') as string
          if (!text) continue
          const chUid = hl.chapterUid as number
          const chapter = chapterMap.get(chUid) || ''
          const content = `#微信读书 #${sanitize(title)}\n\n> ${text}${chapter ? `\n\n-- ${chapter}` : ''}`
          const flomoRes = await fetch(flomoApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          })
          const flomoJson = await flomoRes.json().catch(() => ({}))
          if (flomoJson.code === -1) {
            setFlomoProgress((p) => ({
              ...p,
              status: 'error',
              message: `已同步 ${totalSynced} 条。Flomo 提示：${flomoJson.message || '已达每日 API 上限 100 条'}`,
            }))
            return
          }
          totalSynced++
          // Rate limiting: 1s between requests
          await new Promise((r) => setTimeout(r, 1000))
        }

        // Sync reviews
        for (const rv of reviews) {
          const review = (rv.review || rv) as Record<string, unknown>
          const content_text = (review.content || '') as string
          const abstract = (review.abstract || '') as string
          if (!content_text) continue
          let content = `#微信读书 #${sanitize(title)} #想法\n\n`
          if (abstract) content += `> ${abstract}\n\n`
          content += content_text
          const flomoRes2 = await fetch(flomoApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          })
          const flomoJson2 = await flomoRes2.json().catch(() => ({}))
          if (flomoJson2.code === -1) {
            setFlomoProgress((p) => ({
              ...p,
              status: 'error',
              message: `已同步 ${totalSynced} 条。Flomo 提示：${flomoJson2.message || '已达每日 API 上限 100 条'}`,
            }))
            return
          }
          totalSynced++
          await new Promise((r) => setTimeout(r, 1000))
        }
      }

      setFlomoProgress({
        total, current: total, currentBook: '', status: 'done',
        message: `成功同步 ${totalSynced} 条笔记到 Flomo`,
      })
    } catch (err) {
      setFlomoProgress((p) => ({
        ...p,
        status: 'error',
        message: `同步失败：${err instanceof Error ? err.message : '未知错误'}`,
      }))
    }
  }, [apiKey, flomoApiUrl, booksWithNotes])

  // --- Sync to Notion ---
  const syncToNotion = useCallback(async () => {
    if (!apiKey || !notionToken || !notionDatabaseId || booksWithNotes.length === 0) return
    const total = booksWithNotes.length
    let totalSynced = 0
    setNotionProgress({ total, current: 0, currentBook: '', status: 'fetching', message: '正在获取笔记数据...' })

    try {
      for (let i = 0; i < total; i++) {
        const nb = booksWithNotes[i]
        const bookInfo = (nb.book || {}) as Record<string, unknown>
        const title = (bookInfo.title || '未知书名') as string
        const author = (bookInfo.author || '') as string
        const bookId = (nb.bookId || bookInfo.bookId || '') as string

        setNotionProgress((p) => ({
          ...p,
          current: i,
          currentBook: title,
          status: 'syncing',
          message: `正在同步：${title} (${i + 1}/${total})`,
        }))

        if (!bookId) continue
        const { highlights, reviews, chapterMap } = await fetchBookNotes(apiKey, bookId)

        // Sync highlights to Notion
        for (const hl of highlights) {
          const text = (hl.markText || '') as string
          if (!text) continue
          const chUid = hl.chapterUid as number
          const chapter = chapterMap.get(chUid) || ''

          await fetch('/api/notion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: notionToken,
              databaseId: notionDatabaseId,
              properties: {
                Title: { title: [{ text: { content: title } }] },
                Author: { rich_text: [{ text: { content: author } }] },
                Type: { select: { name: '划线' } },
                Content: { rich_text: [{ text: { content: text.slice(0, 2000) } }] },
                Chapter: { rich_text: [{ text: { content: chapter } }] },
              },
            }),
          })
          totalSynced++
          await new Promise((r) => setTimeout(r, 1000))
        }

        // Sync reviews
        for (const rv of reviews) {
          const review = (rv.review || rv) as Record<string, unknown>
          const content = (review.content || '') as string
          const chapterName = (review.chapterName || '') as string
          if (!content) continue

          await fetch('/api/notion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: notionToken,
              databaseId: notionDatabaseId,
              properties: {
                Title: { title: [{ text: { content: title } }] },
                Author: { rich_text: [{ text: { content: author } }] },
                Type: { select: { name: '想法' } },
                Content: { rich_text: [{ text: { content: content.slice(0, 2000) } }] },
                Chapter: { rich_text: [{ text: { content: chapterName } }] },
              },
            }),
          })
          totalSynced++
          await new Promise((r) => setTimeout(r, 1000))
        }
      }

      setNotionProgress({
        total, current: total, currentBook: '', status: 'done',
        message: `成功同步 ${totalSynced} 条笔记到 Notion`,
      })
    } catch (err) {
      setNotionProgress((p) => ({
        ...p,
        status: 'error',
        message: `同步失败：${err instanceof Error ? err.message : '未知错误'}`,
      }))
    }
  }, [apiKey, notionToken, notionDatabaseId, booksWithNotes])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {"导出数据"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {booksWithNotes.length > 0
            ? `共 ${booksWithNotes.length} 本书有笔记可导出`
            : '加载中...'}
        </p>
      </div>

      {/* Markdown ZIP */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileArchive className="h-4 w-4 text-primary" />
            {"导出为 Markdown (ZIP)"}
          </CardTitle>
          <CardDescription>
            {"将所有书的划线和想法导出为 Markdown 文件，按书名分文件打包为 ZIP 下载"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ExportProgressBar progress={mdProgress} />
          <Button
            onClick={exportMarkdownZip}
            disabled={
              booksWithNotes.length === 0 ||
              mdProgress.status === 'fetching' ||
              mdProgress.status === 'generating'
            }
            className="w-fit"
          >
            {mdProgress.status === 'fetching' || mdProgress.status === 'generating' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {"导出中..."}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {"下载 ZIP"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Flomo */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Flower2 className="h-4 w-4 text-chart-2" />
            {"同步到 Flomo"}
          </CardTitle>
          <CardDescription>
            {"将划线和想法逐条同步到 Flomo，自动添加 #微信读书 和书名标签"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!flomoApiUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
              <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="flex-1 text-sm text-muted-foreground">
                {"尚未配置 Flomo API，请先在"}
                <Link href="/settings" className="text-primary hover:underline mx-1">
                  {"设置页面"}
                </Link>
                {"进行配置"}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  {"去设置"}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <ExportProgressBar progress={flomoProgress} />
              <Button
                onClick={syncToFlomo}
                disabled={
                  booksWithNotes.length === 0 ||
                  flomoProgress.status === 'fetching' ||
                  flomoProgress.status === 'syncing'
                }
                className="w-fit"
                variant="outline"
              >
                {flomoProgress.status === 'fetching' || flomoProgress.status === 'syncing' ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {"同步中..."}
                  </>
                ) : (
                  <>
                    <Flower2 className="mr-2 h-4 w-4" />
                    {"开始同步"}
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notion */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4 text-chart-3" />
            {"同步到 Notion"}
          </CardTitle>
          <CardDescription>
            {"将划线和想法逐条同步到 Notion 数据库，包含书名、作者、类型、章节等属性"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!notionToken || !notionDatabaseId ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
              <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="flex-1 text-sm text-muted-foreground">
                {"尚未配置 Notion 同步，请先在"}
                <Link href="/settings" className="text-primary hover:underline mx-1">
                  {"设置页面"}
                </Link>
                {"进行配置"}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  {"去设置"}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <ExportProgressBar progress={notionProgress} />
              <Button
                onClick={syncToNotion}
                disabled={
                  booksWithNotes.length === 0 ||
                  notionProgress.status === 'fetching' ||
                  notionProgress.status === 'syncing'
                }
                className="w-fit"
                variant="outline"
              >
                {notionProgress.status === 'fetching' || notionProgress.status === 'syncing' ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {"同步中..."}
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    {"开始同步"}
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Overview of books */}
      {booksWithNotes.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              {`可导出书目 (${booksWithNotes.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-border">
              {booksWithNotes.map((nb, i) => {
                const bookInfo = (nb.book || {}) as Record<string, unknown>
                const title = (bookInfo.title || '未知') as string
                const author = (bookInfo.author || '') as string
                const noteCount = (nb.noteCount || 0) as number
                const reviewCount = (nb.reviewCount || 0) as number
                return (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground truncate">{title}</span>
                      {author && <span className="text-xs text-muted-foreground">{author}</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {noteCount > 0 && (
                        <Badge variant="secondary" className="text-xs">{`${noteCount} 划线`}</Badge>
                      )}
                      {reviewCount > 0 && (
                        <Badge variant="outline" className="text-xs">{`${reviewCount} 想法`}</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ExportProgressBar({ progress }: { progress: ExportProgress }) {
  if (progress.status === 'idle') return null

  const pct = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {progress.status === 'done' ? (
          <Check className="h-4 w-4 text-chart-2" />
        ) : progress.status === 'error' ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : (
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
        )}
        <span className={`text-sm ${
          progress.status === 'done'
            ? 'text-chart-2'
            : progress.status === 'error'
              ? 'text-destructive'
              : 'text-muted-foreground'
        }`}>
          {progress.message}
        </span>
      </div>
      {(progress.status === 'fetching' || progress.status === 'syncing' || progress.status === 'generating') && (
        <Progress value={pct} className="h-2" />
      )}
    </div>
  )
}
