import { useWeReadStore } from '@/lib/store'
import { API } from '@/lib/weread'
import useSWR from 'swr'

export async function fetchWeRead(apiKey: string, apiName: string, params: Record<string, unknown> = {}) {
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
export function useNotebooks() {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey ? ['notebooks', apiKey] : null,
    () => fetchWeRead(apiKey!, API.USER_NOTEBOOKS, { count: 200 }),
    { revalidateOnFocus: false }
  )
}

// Reading stats: /readdata/detail
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

// Book progress: /book/getprogress
export function useBookProgress(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['progress', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.BOOK_GET_PROGRESS, { bookId }),
    { revalidateOnFocus: false }
  )
}

// Search: /store/search — V3 format with scope
export function useSearch(keyword: string, scope: number = 10, maxIdx: number = 0) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  const params: Record<string, unknown> = { keyword, scope }
  if (maxIdx > 0) params.maxIdx = maxIdx
  return useSWR(
    apiKey && keyword ? ['search', keyword, scope, maxIdx, apiKey] : null,
    () => fetchWeRead(apiKey!, API.STORE_SEARCH, params),
    { revalidateOnFocus: false, dedupingInterval: 500 }
  )
}

// Book highlights (划线): /book/bookmarklist
export function useBookmarklist(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['bookmarklist', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.BOOK_BOOKMARK_LIST, { bookId }),
    { revalidateOnFocus: false }
  )
}

// Personal reviews/thoughts: /review/list/mine
export function useReviewListMine(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['reviews-mine', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.REVIEW_LIST_MINE, { bookid: bookId, count: 200 }),
    { revalidateOnFocus: false }
  )
}

// Public reviews: /review/list — per review.md
export function useReviewList(bookId: string | null, reviewListType: number = 0, maxIdx: number = 0, synckey: number = 0) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  const params: Record<string, unknown> = { bookId, reviewListType }
  if (maxIdx > 0) params.maxIdx = maxIdx
  if (synckey > 0) params.synckey = synckey
  return useSWR(
    apiKey && bookId ? ['reviews-public', bookId, reviewListType, maxIdx, apiKey] : null,
    () => fetchWeRead(apiKey!, API.REVIEW_LIST, params),
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

// Recommendations: /book/recommend — per discover.md
export function useRecommend(maxIdx: number = 0) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  const params: Record<string, unknown> = { count: 12 }
  if (maxIdx > 0) params.maxIdx = maxIdx
  return useSWR(
    apiKey ? ['recommend', maxIdx, apiKey] : null,
    () => fetchWeRead(apiKey!, API.BOOK_RECOMMEND, params),
    { revalidateOnFocus: false }
  )
}
