import { useWeReadStore } from '@/lib/store'
import { API } from '@/lib/weread'
import useSWR from 'swr'

async function fetchWeRead(apiKey: string, apiName: string, params: Record<string, unknown> = {}) {
  const res = await fetch('/api/weread', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, apiName, ...params }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

// Shelf: /shelf/sync
export function useShelf() {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey ? ['shelf', apiKey] : null,
    () => fetchWeRead(apiKey!, API.SHELF_SYNC),
    { revalidateOnFocus: false }
  )
}

// Notes overview: /user/notebooks
// Returns books[] with per-book counts (reviewCount, noteCount, bookmarkCount)
// Does NOT return note content -- use /book/bookmarklist + /review/list/mine for content
export function useNotebooks() {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey ? ['notebooks', apiKey] : null,
    () => fetchWeRead(apiKey!, API.USER_NOTEBOOKS, { count: 200 }),
    { revalidateOnFocus: false }
  )
}

// Reading stats: /readdata/detail (the only stats API per spec)
// Default mode=monthly; returns totalReadTime (seconds), readDays (number), readTimes (object), etc.
export function useReadDetail(mode: string = 'monthly', baseTime: number = 0) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  const params: Record<string, unknown> = { mode }
  if (baseTime) params.baseTime = baseTime
  return useSWR(
    apiKey ? ['readdetail', mode, baseTime, apiKey] : null,
    () => fetchWeRead(apiKey!, API.READ_DATA_DETAIL, params),
    { revalidateOnFocus: false }
  )
}

// Overall stats for dashboard summary
export function useReadDetailOverall() {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey ? ['readdetail-overall', apiKey] : null,
    () => fetchWeRead(apiKey!, API.READ_DATA_DETAIL, { mode: 'overall' }),
    { revalidateOnFocus: false }
  )
}

// Book info: /book/info
export function useBookInfo(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['book', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.BOOK_INFO, { bookId }),
    { revalidateOnFocus: false }
  )
}

// Book progress: /book/getprogress (per book.md spec)
export function useBookProgress(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['progress', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.BOOK_GET_PROGRESS, { bookId }),
    { revalidateOnFocus: false }
  )
}

// Search: /store/search
export function useSearch(keyword: string) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && keyword ? ['search', keyword, apiKey] : null,
    () => fetchWeRead(apiKey!, API.STORE_SEARCH, { keyword, count: 20 }),
    { revalidateOnFocus: false, dedupingInterval: 500 }
  )
}

// Book highlights (划线): /book/bookmarklist
// Returns updated[] array with markText, chapterUid, range etc.
export function useBookmarklist(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['bookmarklist', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.BOOK_BOOKMARK_LIST, { bookId }),
    { revalidateOnFocus: false }
  )
}

// Book reviews/thoughts (想法/点评): /review/list/mine
// Returns reviews[] with review.content, review.chapterName, etc.
export function useReviewListMine(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['reviews', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.REVIEW_LIST_MINE, { bookid: bookId, count: 200 }),
    { revalidateOnFocus: false }
  )
}

// Best bookmarks (热门划线): /book/bestbookmarks
export function useBestBookmarks(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['bestbookmarks', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.BOOK_BEST_BOOKMARKS, { bookId }),
    { revalidateOnFocus: false }
  )
}
