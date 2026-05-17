'use client'

import { useShelf } from '@/hooks/use-weread'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function ShelfView() {
  const { data, isLoading } = useShelf()

  const books = data?.books || data?.shelf || []
  const allBooks = Array.isArray(books) ? books : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {"书架"}
        </h1>
        <p className="mt-1 text-muted-foreground">{`共 ${allBooks.length} 本书`}</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="all">{"全部"}</TabsTrigger>
          <TabsTrigger value="reading">{"在读"}</TabsTrigger>
          <TabsTrigger value="finished">{"已读"}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <BookGrid books={allBooks} loading={isLoading} />
        </TabsContent>
        <TabsContent value="reading" className="mt-6">
          <BookGrid
            books={allBooks.filter((b: Record<string, unknown>) => {
              const info = (b.bookInfo || b) as Record<string, unknown>
              return !info.finished && !info.isFinished
            })}
            loading={isLoading}
          />
        </TabsContent>
        <TabsContent value="finished" className="mt-6">
          <BookGrid
            books={allBooks.filter((b: Record<string, unknown>) => {
              const info = (b.bookInfo || b) as Record<string, unknown>
              return info.finished || info.isFinished
            })}
            loading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookGrid({ books, loading }: { books: Record<string, unknown>[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{"暂无书籍"}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {books.map((book: Record<string, unknown>, i: number) => {
        const bookInfo = (book.bookInfo || book) as Record<string, unknown>
        const title = (bookInfo.title || '未知书名') as string
        const author = (bookInfo.author || '未知作者') as string
        const cover = (bookInfo.cover || bookInfo.coverUrl || '') as string
        const bookId = (bookInfo.bookId || '') as string

        return (
          <Link
            key={bookId || i}
            href={bookId ? `/book/${bookId}` : '#'}
            className="group flex flex-col gap-3"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-sm transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
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
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground line-clamp-2 text-pretty">
                {title}
              </span>
              <span className="text-xs text-muted-foreground line-clamp-1">
                {author}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
