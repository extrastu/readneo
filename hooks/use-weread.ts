import { useWeReadStore } from '@/lib/store'
import { API } from '@/lib/weread'
import useSWR from 'swr'

async function fetchWeRead(apiKey: string, apiName: string, params: Record<string, unknown> = {}) {
  const res = await fetch('/api/weread', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Per SKILL spec: params flat at top level alongside apiKey/apiName
    body: JSON.stringify({ apiKey, apiName, ...params }),
  })

  const data = await res.json()

  // Surface error message from upstream even if our proxy returns non-ok
  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

export function useShelf() {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey ? ['shelf', apiKey] : null,
    () => fetchWeRead(apiKey!, API.SHELF_SYNC),
    { revalidateOnFocus: false }
  )
}

export function useNotebooks() {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey ? ['notebooks', apiKey] : null,
    () => fetchWeRead(apiKey!, API.USER_NOTEBOOKS, { count: 100 }),
    { revalidateOnFocus: false }
  )
}

export function useReadStats() {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey ? ['readstats', apiKey] : null,
    () => fetchWeRead(apiKey!, API.READ_DATA_DETAIL),
    { revalidateOnFocus: false }
  )
}

export function useReadStat() {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey ? ['readstat', apiKey] : null,
    () => fetchWeRead(apiKey!, API.READ_DATA_STAT),
    { revalidateOnFocus: false }
  )
}

export function useBookInfo(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['book', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.BOOK_INFO, { bookId }),
    { revalidateOnFocus: false }
  )
}

export function useSearch(keyword: string) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && keyword ? ['search', keyword, apiKey] : null,
    () => fetchWeRead(apiKey!, API.STORE_SEARCH, { keyword, count: 20 }),
    { revalidateOnFocus: false, dedupingInterval: 500 }
  )
}

// Use /book/bookmarklist per SKILL spec (not /book/bookmarks)
export function useBookmarks(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['bookmarks', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.BOOK_BOOKMARK_LIST, { bookId }),
    { revalidateOnFocus: false }
  )
}
