'use client'

import { useReadDetail, useReadDetailOverall } from '@/hooks/use-weread'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, BookOpen, Calendar, TrendingUp } from 'lucide-react'
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { useState } from 'react'

function formatDuration(seconds: number): string {
  if (!seconds) return '0 分钟'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes} 分钟`
}

function formatShortDuration(seconds: number): string {
  if (!seconds) return '0m'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h${minutes > 0 ? `${minutes}m` : ''}`
  return `${minutes}m`
}

type ModeType = 'weekly' | 'monthly' | 'annually' | 'overall'

export function StatsView() {
  const [mode, setMode] = useState<ModeType>('monthly')
  const { data: detailData, isLoading: detailLoading } = useReadDetail(mode)
  const { data: overallData, isLoading: overallLoading } = useReadDetailOverall()

  const isLoading = detailLoading || overallLoading

  const totalReadTime = (detailData?.totalReadTime || 0) as number
  const readDays = (detailData?.readDays || 0) as number
  const dayAverageReadTime = (detailData?.dayAverageReadTime || 0) as number
  const compare = detailData?.compare as number | undefined

  const overallReadTime = (overallData?.totalReadTime || 0) as number

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

  const readLongest = (detailData?.readLongest || []) as Record<string, unknown>[]
  const readStatItems = (detailData?.readStat || []) as Record<string, unknown>[]
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {"阅读统计"}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">{"可视化你的阅读历程"}</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-1.5 p-1 bg-muted/60 rounded-lg w-fit">
        {(['weekly', 'monthly', 'annually', 'overall'] as ModeType[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
              mode === m
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatMiniCard
          icon={Clock}
          label={`${modeLabels[mode]}时长`}
          value={formatDuration(totalReadTime)}
          loading={isLoading}
          accent
        />
        <StatMiniCard
          icon={Calendar}
          label="阅读天数"
          value={`${readDays} 天`}
          loading={isLoading}
        />
        <StatMiniCard
          icon={TrendingUp}
          label="日均时长"
          value={formatDuration(dayAverageReadTime)}
          loading={isLoading}
        />
        <StatMiniCard
          icon={BookOpen}
          label="累计总时长"
          value={formatDuration(overallReadTime)}
          loading={overallLoading}
        />
      </div>

      {/* Compare badge */}
      {compare !== undefined && compare !== null && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium w-fit ${
          compare >= 0 ? 'bg-chart-2/10 text-chart-2' : 'bg-destructive/10 text-destructive'
        }`}>
          <TrendingUp className={`h-3.5 w-3.5 ${compare < 0 && 'rotate-180'}`} />
          {compare >= 0
            ? `相比上个周期增长 ${Math.round(compare * 100)}%`
            : `相比上个周期下降 ${Math.round(Math.abs(compare) * 100)}%`}
        </div>
      )}

      {/* Stat badges */}
      {readStatItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {readStatItems.map((item, i) => (
            <Badge key={i} variant="secondary" className="text-[13px] px-3 py-1 font-normal">
              {`${item.stat}: ${item.counts}`}
            </Badge>
          ))}
        </div>
      )}

      {/* Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 px-5 pt-5">
          <CardTitle className="text-[15px] font-semibold text-foreground">
            {`${modeLabels[mode]}阅读时长`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : readTimesEntries.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={readTimesEntries}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.48 0.14 42)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="oklch(0.48 0.14 42)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'oklch(0.45 0.015 50)' }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'oklch(0.45 0.015 50)' }}
                  axisLine={false}
                  tickLine={false}
                  dx={-8}
                  unit="m"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.92 0.008 75)',
                    borderRadius: '8px',
                    fontSize: 13,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
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
                  stroke="oklch(0.48 0.14 42)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMinutes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-56 items-center justify-center text-[15px] text-muted-foreground">
              {"暂无阅读数据"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top books */}
      {readLongest.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-[15px] font-semibold text-foreground">
              {"读得最多"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
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
                  <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="w-5 text-center text-[13px] font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    {itemCover ? (
                      <img
                        src={itemCover}
                        alt={itemTitle}
                        className="h-11 w-8 shrink-0 rounded object-cover shadow-sm ring-1 ring-border/50"
                      />
                    ) : (
                      <div className="flex h-11 w-8 shrink-0 items-center justify-center rounded bg-muted ring-1 ring-border/50">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-foreground truncate">{itemTitle}</span>
                      <span className="text-xs text-muted-foreground truncate">{itemAuthor}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {tags.map((tag, j) => (
                        <Badge key={j} variant="outline" className="text-[11px] px-2 py-0 h-5">
                          {tag}
                        </Badge>
                      ))}
                      <span className="text-[13px] font-semibold text-foreground tabular-nums">
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

      {/* Preferences */}
      {(preferCategories.length > 0 || preferTimeWord) && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-[15px] font-semibold text-foreground">
              {"阅读偏好"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 flex flex-col gap-4">
            {preferTimeWord && (
              <p className="text-[13px] text-muted-foreground">{preferTimeWord}</p>
            )}
            {preferCategories.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {preferCategories.map((cat, i) => {
                  const catTitle = (cat.categoryTitle || '') as string
                  const val = (cat.val || 0) as number
                  const readingCount = (cat.readingCount || 0) as number
                  const readingTime = (cat.readingTime || 0) as number

                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-[13px] text-foreground truncate">
                        {catTitle}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(val * 100, 3)}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
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
  accent,
}: {
  icon: React.ElementType
  label: string
  value: string
  loading: boolean
  accent?: boolean
}) {
  return (
    <Card className={`border-0 shadow-sm transition-all hover:shadow-md ${accent ? 'bg-primary/5' : 'bg-card'}`}>
      <CardContent className="flex flex-col gap-2.5 p-4">
        <Icon className={`h-[18px] w-[18px] ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <span className="text-lg font-semibold tracking-tight text-foreground">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
