const WEREAD_GATEWAY = 'https://i.weread.qq.com/api/agent/gateway'

export async function wereadFetch(apiKey: string, apiName: string, body: Record<string, unknown> = {}) {
  const res = await fetch(WEREAD_GATEWAY, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_name: apiName,
      skill_version: '1.0.3',
      ...body,
    }),
  })

  if (!res.ok) {
    throw new Error(`WeRead API error: ${res.status}`)
  }

  return res.json()
}

// API names
export const API = {
  SHELF_SYNC: '/shelf/sync',
  BOOK_INFO: '/book/info',
  BOOK_PROGRESS: '/book/progress',
  USER_NOTEBOOKS: '/user/notebooks',
  BOOK_BOOKMARKS: '/book/bookmarks',
  BOOK_BEST_BOOKMARKS: '/book/bestbookmarks',
  READ_DATA_STAT: '/readdata/stat',
  READ_DATA_DETAIL: '/readdata/detail',
  STORE_SEARCH: '/store/search',
  USER_PROFILE: '/user/profile',
} as const
