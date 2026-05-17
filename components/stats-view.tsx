'use client'

import { useReadStats, useReadStat } from '@/hooks/use-weread'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, Clock, BookOpen, Flame } from 'lucide-react'
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

function formatMinutes(seconds: number): number {
  return Math.round(seconds / 60)
}

export function StatsView() {
  const { data: detailData, isLoading: detailLoading } = useReadStats()
  const { data: statData, isLoading: statLoading } = useReadStat()

  const isLoading = detailLoading || statLoading

  // Extract reading data
  const readDays = detailData?.readDays || detailData?.days || []
  const dailyData = Array.isArray(readDays)
    ? readDays.slice(-30).map((d: Record<string, unknown>) => ({
        date: (d.date || d.day || '') as string,
        minutes: formatMinutes((d.readTime || d.duration || 0) as number),
      }))
    : []

  // Monthly aggregation
  const monthlyMap = new Map<string, number>()
  if (Array.isArray(readDays)) {
    readDays.forEach((d: Record<string, unknown>) => {
      const date = (d.date || d.day || '') as string
      const month = date.slice(0, 7)
      if (month) {
        const current = monthlyMap.get(month) || 0
        monthlyMap.set(month, current + formatMinutes((d.readTime || d.duration || 0) as number))
      }
    })
  }
  const monthlyData = Array.from(monthlyMap.entries())
    .slice(-12)
    .map(([month, minutes]) => ({ month, minutes }))

  const totalReadTime = statData?.readTime || statData?.totalReadTime || 0
  const totalBooks = statData?.bookCount || statData?.finishedBookCount || 0
  const totalDays = statData?.readDayCount || (Array.isArray(readDays) ? readDays.length : 0)
  const streak = statData?.streak || statData?.continuousReadDays || 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {"阅读统计"}
        </h1>
        <p className="mt-1 text-muted-foreground">{"可视化你的阅读历程"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatMiniCard
          icon={Clock}
          label="总时长"
          value={`${Math.round(totalReadTime / 3600)} 小时`}
          loading={isLoading}
        />
        <StatMiniCard
          icon={BookOpen}
          label="读完书籍"
          value={`${totalBooks} 本`}
          loading={isLoading}
        />
        <StatMiniCard
          icon={BarChart3}
          label="阅读天数"
          value={`${totalDays} 天`}
          loading={isLoading}
        />
        <StatMiniCard
          icon={Flame}
          label="连续阅读"
          value={`${streak} 天`}
          loading={isLoading}
        />
      </div>

      {/* Daily reading chart */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            {"近 30 天阅读时长"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyData}>
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
                  tickFormatter={(v: string) => v.slice(5)}
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
                  labelFormatter={(label: string) => `日期: ${label}`}
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

      {/* Monthly reading chart */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            {"月度阅读趋势"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 80)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 60)' }}
                  tickFormatter={(v: string) => v.slice(5) + ' 月'}
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
                  labelFormatter={(label: string) => `${label}`}
                />
                <Bar
                  dataKey="minutes"
                  fill="oklch(0.55 0.12 45)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              {"暂无月度数据"}
            </div>
          )}
        </CardContent>
      </Card>
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
