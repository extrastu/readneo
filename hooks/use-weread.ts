import { useWeReadStore } from '@/lib/store'
import { API } from '@/lib/weread'
import useSWR from 'swr'

async function fetchWeRead(apiKey: string, apiName: string, params: Record<string, unknown> = {}) {
  const res = await fetch('/api/weread', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, apiName, ...params }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Request failed')
  }

  return res.json()
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
    () => fetchWeRead(apiKey!, API.USER_NOTEBOOKS),
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

export function useUserProfile() {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey ? ['profile', apiKey] : null,
    () => fetchWeRead(apiKey!, API.USER_PROFILE),
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
    () => fetchWeRead(apiKey!, API.STORE_SEARCH, { keyword }),
    { revalidateOnFocus: false, dedupingInterval: 500 }
  )
}

export function useBookmarks(bookId: string | null) {
  const apiKey = useWeReadStore((s) => s.apiKey)
  return useSWR(
    apiKey && bookId ? ['bookmarks', bookId, apiKey] : null,
    () => fetchWeRead(apiKey!, API.BOOK_BOOKMARKS, { bookId }),
    { revalidateOnFocus: false }
  )
}
