'use client'

import { useReadDetail, useReadDetailOverall } from '@/hooks/use-weread'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Clock, BookOpen, Flame, Calendar, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { useState } from 'react'

// Per readdata.md: all time fields are in SECONDS
function formatDuration(seconds: number): string {
  if (!seconds) return '0 分钟'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours} 小时 ${minutes} 分钟`
  return `${minutes} 分钟`
}

function formatShortDuration(seconds: number): string {
  if (!seconds) return '0分'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h${minutes}m`
  return `${minutes}m`
}

type ModeType = 'weekly' | 'monthly' | 'annually' | 'overall'

export function StatsView() {
  const [mode, setMode] = useState<ModeType>('monthly')
  const { data: detailData, isLoading: detailLoading } = useReadDetail(mode)
  const { data: overallData, isLoading: overallLoading } = useReadDetailOverall()

  const isLoading = detailLoading || overallLoading

  // Per readdata.md: totalReadTime is in seconds
  const totalReadTime = (detailData?.totalReadTime || 0) as number
  const readDays = (detailData?.readDays || 0) as number
  const dayAverageReadTime = (detailData?.dayAverageReadTime || 0) as number
  const compare = detailData?.compare as number | undefined

  // Overall stats for top cards
  const overallReadTime = (overallData?.totalReadTime || 0) as number
  const overallReadDays = (overallData?.readDays || 0) as number

  // Per readdata.md: readTimes is an object { timestamp: seconds }
  const readTimes = (detailData?.readTimes || {}) as Record<string, number>
  const readTimesEntries = Object.entries(readTimes)
    .map(([ts, seconds]) => ({
      timestamp: Number(ts),
      date: new Date(Number(ts) * 1000).toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      }),
      fullDate: new Date(Number(ts) * 1000).toLocaleDateString('zh-CN'),
      minutes: Math.round(seconds / 60),
      seconds,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  // Per readdata.md: readLongest[] is top books by reading time
  const readLongest = (detailData?.readLongest || []) as Record<string, unknown>[]

  // Per readdata.md: readStat[] has stat/counts pairs
  const readStatItems = (detailData?.readStat || []) as Record<string, unknown>[]

  // Per readdata.md: preferCategory[] for reading preferences
  const preferCategories = (detailData?.preferCategory || []) as Record<string, unknown>[]
  const preferTimeWord = (detailData?.preferTimeWord || '') as string

  const modeLabels: Record<ModeType, string> = {
    weekly: '本周',
    monthly: '本月',
    annually: '今年',
    overall: '全部',
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {"阅读统计"}
        </h1>
        <p className="mt-1 text-muted-foreground">{"可视化你的阅读历程"}</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        {(['weekly', 'monthly', 'annually', 'overall'] as ModeType[]).map((m) => (
          <Button
            key={m}
            variant={mode === m ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode(m)}
          >
            {modeLabels[m]}
          </Button>
        ))}
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatMiniCard
          icon={Clock}
          label={`${modeLabels[mode]}时长`}
          value={formatDuration(totalReadTime)}
          loading={isLoading}
        />
        <StatMiniCard
          icon={Calendar}
          label="阅读天数"
          value={`${readDays} 天`}
          loading={isLoading}
        />
        <StatMiniCard
          icon={BarChart3}
          label="日均时长"
          value={formatDuration(dayAverageReadTime)}
          loading={isLoading}
        />
        <StatMiniCard
          icon={TrendingUp}
          label="累计总时长"
          value={formatDuration(overallReadTime)}
          loading={overallLoading}
        />
      </div>

      {/* Compare with last period */}
      {compare !== undefined && compare !== null && (
        <div className="text-sm text-muted-foreground">
          {compare >= 0
            ? `相比上个周期，日均阅读增长 ${Math.round(compare * 100)}%`
            : `相比上个周期，日均阅读下降 ${Math.round(Math.abs(compare) * 100)}%`}
        </div>
      )}

      {/* readStat summary badges */}
      {readStatItems.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {readStatItems.map((item, i) => (
            <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
              {`${item.stat}: ${item.counts}`}
            </Badge>
          ))}
        </div>
      )}

      {/* Reading time chart */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            {`${modeLabels[mode]}阅读时长`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : readTimesEntries.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={readTimesEntries}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.12 45)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.12 45)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 80)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 60)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 60)' }}
                  axisLine={false}
                  tickLine={false}
                  unit=" 分"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.91 0.01 80)',
                    borderRadius: '8px',
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [`${value} 分钟`, '阅读时长']}
                  labelFormatter={(_: unknown, payload: Array<Record<string, unknown>>) => {
                    if (payload?.[0]?.payload) {
                      const p = payload[0].payload as { fullDate: string }
                      return p.fullDate
                    }
                    return ''
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="oklch(0.55 0.12 45)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMinutes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              {"暂无阅读数据"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top books by reading time */}
      {readLongest.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              {"读得最多"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-border">
              {readLongest.map((item, i) => {
                const book = (item.book || {}) as Record<string, unknown>
                const albumInfo = (item.albumInfo || {}) as Record<string, unknown>
                const itemTitle = (book.title || albumInfo.title || '未知') as string
                const itemAuthor = (book.author || albumInfo.author || '') as string
                const itemCover = (book.cover || albumInfo.cover || '') as string
                const itemReadTime = (item.readTime || 0) as number
                const tags = (item.tags || []) as string[]

                return (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <span className="w-6 text-center text-sm font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    {itemCover ? (
                      <img
                        src={itemCover}
                        alt={itemTitle}
                        className="h-12 w-9 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded bg-accent">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">{itemTitle}</span>
                      <span className="text-xs text-muted-foreground truncate">{itemAuthor}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {tags.map((tag, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      <span className="text-sm font-medium text-foreground">
                        {formatShortDuration(itemReadTime)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reading preferences */}
      {(preferCategories.length > 0 || preferTimeWord) && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              {"阅读偏好"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {preferTimeWord && (
              <p className="text-sm text-muted-foreground">{preferTimeWord}</p>
            )}
            {preferCategories.length > 0 && (
              <div className="flex flex-col gap-2">
                {preferCategories.map((cat, i) => {
                  const catTitle = (cat.categoryTitle || '') as string
                  const val = (cat.val || 0) as number
                  const readingCount = (cat.readingCount || 0) as number
                  const readingTime = (cat.readingTime || 0) as number

                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-sm text-foreground truncate">
                        {catTitle}
                      </span>
                      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full transition-all"
                          style={{ width: `${Math.max(val * 100, 4)}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {readingCount > 0
                          ? `${readingCount}本 / ${formatShortDuration(readingTime)}`
                          : formatShortDuration(readingTime)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatMiniCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType
  label: string
  value: string
  loading: boolean
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-2 p-5">
        <Icon className="h-5 w-5 text-primary" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <span className="text-xl font-semibold tracking-tight text-foreground">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Need Button import for mode selector
import { Button } from '@/components/ui/button'
