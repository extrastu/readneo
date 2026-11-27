'use client'

import { useWeReadStore } from '@/lib/store'
import { AppShell } from '@/components/app-shell'
import { BookDetailView } from '@/components/book-detail-view'
import { useEffect, useMemo, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'

/**
 * 从当前路径与路由参数中解析真实的书籍 ID
 * 在 Cloudflare Pages 静态导出 rewrite（/book/* -> /book/_）场景下，
 * 静态预渲染参数可能为占位符 "_"，此时优先回退从真实 pathname 提取。
 * @param paramBookId Next.js 路由参数中的 bookId
 * @param pathname 当前浏览器路径名
 * @returns 解码后的真实 bookId；若无法解析则返回空字符串
 */
function resolveBookId(paramBookId: string | string[] | undefined, pathname: string | null): string {
  const rawParam = Array.isArray(paramBookId) ? paramBookId[0] : paramBookId
  if (rawParam && rawParam !== '_') {
    return rawParam
  }

  if (pathname) {
    const match = pathname.match(/^\/book\/([^/?#]+)/)
    if (match?.[1] && match[1] !== '_') {
      try {
        return decodeURIComponent(match[1])
      } catch {
        return match[1]
      }
    }
  }

  return ''
}

/**
 * 书籍详情页客户端容器组件，负责校验配置状态并向详情视图传递真实 bookId
 */
export function BookDetailClient() {
  const isConfigured = useWeReadStore((s) => s.isConfigured)
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()

  const bookId = useMemo(
    () => resolveBookId(params?.bookId, pathname),
    [params?.bookId, pathname]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isConfigured) router.push('/')
  }, [mounted, isConfigured, router])

  if (!mounted || !isConfigured || !bookId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AppShell>
      <BookDetailView bookId={bookId} />
    </AppShell>
  )
}
