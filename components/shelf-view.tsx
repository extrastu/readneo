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

  const books = data?.books || []
  const albums = data?.albums || []
  const allBooks = [
    ...(Array.isArray(books) ? books : []),
    ...(Array.isArray(albums) ? albums : []),
  ]
  const totalCount = allBooks.length + (data?.mp ? 1 : 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {"书架"}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">{`共 ${totalCount} 本书`}</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="h-9 bg-muted/60 p-0.5">
          <TabsTrigger value="all" className="h-8 px-4 text-[13px]">{"全部"}</TabsTrigger>
          <TabsTrigger value="reading" className="h-8 px-4 text-[13px]">{"在读"}</TabsTrigger>
          <TabsTrigger value="finished" className="h-8 px-4 text-[13px]">{"已读"}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-5">
          <BookGrid books={allBooks} loading={isLoading} />
        </TabsContent>
        <TabsContent value="reading" className="mt-5">
          <BookGrid
            books={allBooks.filter((b: Record<string, unknown>) => {
              const info = (b.bookInfo || b) as Record<string, unknown>
              return !info.finished && !info.isFinished
            })}
            loading={isLoading}
          />
        </TabsContent>
        <TabsContent value="finished" className="mt-5">
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2.5">
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
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-[15px] text-muted-foreground">{"暂无书籍"}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
            className="group flex flex-col gap-2.5"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-sm ring-1 ring-border/50 transition-all duration-200 group-hover:shadow-lg group-hover:ring-border group-hover:-translate-y-0.5">
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
                  <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5 px-0.5">
              <span className="text-[13px] font-medium text-foreground line-clamp-2 leading-snug">
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
