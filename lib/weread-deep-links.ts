type DeepLinkValue = string | number

export type PositionDeepLinkOptions = {
  bookId: DeepLinkValue | null | undefined
  chapterUid: DeepLinkValue | null | undefined
  range: unknown
  userVid?: DeepLinkValue | null
}

function normalizeIdentifier(value: unknown): string | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? String(value) : null
  }

  if (typeof value !== 'string') return null

  const normalized = value.trim()
  if (!normalized || /^0+$/.test(normalized)) return null
  return normalized
}

function normalizePosition(value: unknown): string | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? String(value) : null
  }

  if (typeof value !== 'string') return null

  const normalized = value.trim()
  if (!/^\d+$/.test(normalized)) return null
  return normalized.replace(/^0+(?=\d)/, '')
}

function normalizePositiveInteger(value: unknown): string | null {
  const normalized = normalizePosition(value)
  return normalized === '0' ? null : normalized
}

function compareIntegerStrings(left: string, right: string): number {
  if (left.length !== right.length) return left.length < right.length ? -1 : 1
  if (left === right) return 0
  return left < right ? -1 : 1
}

function parseRange(range: unknown): { start: string; end: string } | null {
  let start: unknown
  let end: unknown

  if (typeof range === 'string') {
    const match = range.trim().match(/^(\d+)\s*-\s*(\d+)$/)
    if (!match) return null
    start = match[1]
    end = match[2]
  } else if (Array.isArray(range) && range.length === 2) {
    start = range[0]
    end = range[1]
  } else {
    return null
  }

  const normalizedStart = normalizePosition(start)
  const normalizedEnd = normalizePosition(end)
  if (!normalizedStart || !normalizedEnd) return null
  if (compareIntegerStrings(normalizedStart, normalizedEnd) > 0) return null

  return { start: normalizedStart, end: normalizedEnd }
}

function buildDeepLink(path: string, params: Record<string, string>): string {
  return `weread://${path}?${new URLSearchParams(params).toString()}`
}

/** Build a link that opens the book in WeRead. */
export function buildBookDeepLink(bookId: DeepLinkValue | null | undefined): string | null {
  const normalizedBookId = normalizeIdentifier(bookId)
  if (!normalizedBookId) return null

  return buildDeepLink('reading', { bId: normalizedBookId })
}

/** Build a link that opens a WeRead thought/review in its detail view. */
export function buildReviewDeepLink(reviewId: DeepLinkValue | null | undefined): string | null {
  const normalizedReviewId = normalizeIdentifier(reviewId)
  if (!normalizedReviewId) return null

  return buildDeepLink('reviewDetail', {
    reviewId: normalizedReviewId,
    reviewType: '1',
    style: '1',
    isFromBook: '0',
    isLike: '0',
    s: 'book_review',
    promoteId: 'book_review',
  })
}

/** Build a link that opens a highlighted position in WeRead. */
export function buildPositionDeepLink({
  bookId,
  chapterUid,
  range,
  userVid,
}: PositionDeepLinkOptions): string | null {
  const normalizedBookId = normalizeIdentifier(bookId)
  const normalizedChapterUid = normalizePositiveInteger(chapterUid)
  const parsedRange = parseRange(range)

  if (!normalizedBookId || !normalizedChapterUid || !parsedRange) return null

  const params: Record<string, string> = {
    bookId: normalizedBookId,
    chapterUid: normalizedChapterUid,
    rangeStart: parsedRange.start,
    rangeEnd: parsedRange.end,
  }

  const normalizedUserVid = normalizeIdentifier(userVid)
  if (normalizedUserVid) params.userVid = normalizedUserVid

  return buildDeepLink('bestbookmark', params)
}
