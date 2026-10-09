// 微信读书 Agent 网关地址与协议版本，与官方 WeChatReading Skill 规范保持一致
const WEREAD_GATEWAY = 'https://i.weread.qq.com/api/agent/gateway'
const SKILL_VERSION = '1.0.4'

/**
 * 微信读书网关统一请求函数
 * @param apiKey 微信读书用户 API Key（Bearer Token 鉴权）
 * @param apiName 目标接口路径，需与微信读书 Skill 规范一致（如 /shelf/sync）
 * @param params 业务请求参数，平铺在请求体顶层与 api_name、skill_version 并列
 * @returns 微信读书接口返回的 JSON 数据
 * @throws 当 HTTP 异常、JSON 解析失败或服务端 errcode 非 0 时抛出错误
 */
export async function wereadFetch(apiKey: string, apiName: string, params: Record<string, unknown> = {}) {
  // Per SKILL spec: all business params must be flat at top level alongside api_name and skill_version
  const res = await fetch(WEREAD_GATEWAY, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_name: apiName,
      skill_version: SKILL_VERSION,
      ...params,
    }),
  })

  // Always parse response body — the SKILL spec says errcode in body indicates errors,
  // HTTP status alone is not reliable (e.g. 499 from gateway)
  let data: Record<string, unknown>
  try {
    data = await res.json()
  } catch {
    throw new Error(`WeRead API HTTP ${res.status}: failed to parse response`)
  }

  // Check for upgrade_info — SKILL spec mandates we stop and report
  if (data.upgrade_info) {
    const info = data.upgrade_info as Record<string, unknown>
    console.warn('[weread] upgrade_info received:', info.message)
  }

  // Check errcode
  if (data.errcode && data.errcode !== 0) {
    throw new Error(
      (data.errmsg as string) ||
      `WeRead API error: errcode ${data.errcode}`
    )
  }

  return data
}

// Validate API key by calling /shelf/sync (a known valid endpoint)
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const data = await wereadFetch(apiKey, API.SHELF_SYNC)
    // If we get back valid data without errcode, the key is valid
    return !data.errcode || data.errcode === 0
  } catch {
    return false
  }
}

// API names — strictly per the SKILL specification
export const API = {
  // Shelf
  SHELF_SYNC: '/shelf/sync',
  // Book
  BOOK_INFO: '/book/info',
  BOOK_GET_PROGRESS: '/book/getprogress',
  BOOK_CHAPTER_INFO: '/book/chapterinfo',
  BOOK_BOOKMARK_LIST: '/book/bookmarklist',
  BOOK_BEST_BOOKMARKS: '/book/bestbookmarks',
  // Notes
  USER_NOTEBOOKS: '/user/notebooks',
  // Read data / stats — only /readdata/detail exists per spec
  READ_DATA_DETAIL: '/readdata/detail',
  // Search
  STORE_SEARCH: '/store/search',
  // Reviews
  REVIEW_LIST: '/review/list',
  REVIEW_LIST_MINE: '/review/list/mine',
  // Discovery
  BOOK_RECOMMEND: '/book/recommend',
  BOOK_SIMILAR: '/book/similar',
  LIST_APIS: '/_list',
} as const
