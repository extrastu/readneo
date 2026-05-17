'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Library,
  BarChart3,
  Highlighter,
  Search,
  Sparkles,
  Download,
  ArrowRight,
  Key,
  BookOpen,
  PenLine,
  TrendingUp,
  FileText,
  Github,
} from 'lucide-react'
import { useWeReadStore } from '@/lib/store'

const features = [
  {
    icon: Library,
    title: '书架管理',
    desc: '同步微信读书书架，浏览全部藏书，查看阅读进度',
  },
  {
    icon: BarChart3,
    title: '阅读统计',
    desc: '可视化阅读时长与趋势，洞察你的阅读习惯',
  },
  {
    icon: Highlighter,
    title: '笔记划线',
    desc: '按书分类浏览高亮和笔记，支持一键复制',
  },
  {
    icon: Search,
    title: '书城搜索',
    desc: '搜索微信读书书城，按类型筛选内容',
  },
  {
    icon: Sparkles,
    title: '个性化推荐',
    desc: '基于阅读偏好，获取个性化书籍推荐',
  },
  {
    icon: Download,
    title: '数据导出',
    desc: '导出 Markdown，同步到 Flomo 或 Notion',
  },
]

const steps = [
  {
    num: '01',
    icon: BookOpen,
    title: '打开微信读书 App',
    desc: '进入「我」→「设置」→「微信读书 Skill」',
  },
  {
    num: '02',
    icon: Key,
    title: '复制 API Key',
    desc: '滚到底部找到 API Key 并复制',
  },
  {
    num: '03',
    icon: TrendingUp,
    title: '开始使用',
    desc: '粘贴 API Key 即可查看全部数据',
  },
]

const highlights = [
  { icon: PenLine, label: '书评点评', desc: '查看热门书评与个人想法' },
  { icon: FileText, label: 'Notion 同步', desc: '一键同步笔记到 Notion' },
  { icon: Sparkles, label: 'Flomo 同步', desc: '逐条推送划线到 Flomo' },
]

export function LandingPage() {
  const [showSetup, setShowSetup] = useState(false)
  const [apiKey, setApiKeyInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setApiKey = useWeReadStore((s) => s.setApiKey)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/weread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim(), apiName: '/shelf/sync' }),
      })
      if (!res.ok) throw new Error('fail')
      setApiKey(apiKey.trim())
    } catch {
      setError('API Key 验证失败，请检查后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="readNeo" className="h-8 w-8 rounded-lg shadow-sm" />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">readNeo</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/extrastu/readneo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <Button
              size="sm"
              className="h-9 px-4 text-[13px] font-medium"
              onClick={() => {
                setShowSetup(true)
                setTimeout(() => {
                  document.getElementById('setup-section')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
            >
              {"开始使用"}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-5 pb-20 pt-16 md:pb-24 md:pt-24">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-2 animate-pulse" />
              <span className="text-[12px] font-medium text-muted-foreground">{"基于微信读书 Skill API"}</span>
            </div>
            <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl md:leading-tight text-balance">
              {"你的微信读书"}
              <br />
              <span className="text-primary">{"数据面板"}</span>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground md:text-base text-pretty">
              {"连接微信读书，可视化书架、阅读统计、笔记划线，一键导出到 Notion 和 Flomo。"}
            </p>
            <div className="mt-7 flex items-center gap-3">
              <Button
                size="lg"
                className="h-11 px-6 text-[15px] font-medium shadow-sm"
                onClick={() => {
                  setShowSetup(true)
                  setTimeout(() => {
                    document.getElementById('setup-section')?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
              >
                {"立即连接"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-6 text-[15px] font-medium border-border/60"
                onClick={() => {
                  document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {"了解更多"}
              </Button>
            </div>
          </div>
        </div>
        {/* Gradient orb */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/4 blur-3xl" />
      </section>

      {/* Features */}
      <section id="features-section" className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {"你的阅读，一目了然"}
            </h2>
            <p className="mt-2.5 text-[15px] text-muted-foreground">
              {"readNeo 帮你汇聚微信读书的全部数据"}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm transition-all hover:shadow-md bg-card">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8">
                    <f.icon className="h-[18px] w-[18px] text-primary" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-foreground">{f.title}</h3>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sync highlights */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl text-balance">
                {"同步到你最爱的工具"}
              </h2>
              <p className="mt-3.5 text-[15px] leading-relaxed text-muted-foreground">
                {"支持导出为 Markdown ZIP 离线存档，也可以一键同步到 Notion 数据库和 Flomo 卡片笔记。"}
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              {highlights.map((h) => (
                <div key={h.label} className="flex items-start gap-3.5 rounded-xl border-0 bg-card p-4 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                    <h.icon className="h-[18px] w-[18px] text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{h.label}</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {"三步开始"}
            </h2>
            <p className="mt-2.5 text-[15px] text-muted-foreground">
              {"只需一个 API Key，即刻解锁全部功能"}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center">
                <span className="mb-3 text-2xl font-bold text-primary/15">{s.num}</span>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup / CTA */}
      <section id="setup-section" className="border-t border-border/40">
        <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
          <div className="mx-auto max-w-md">
            {showSetup ? (
              <div className="flex flex-col items-center">
                <img src="/icon.svg" alt="readNeo" className="mb-5 h-12 w-12 rounded-xl shadow-sm" />
                <h2 className="mb-2 text-lg font-semibold tracking-tight text-foreground text-center">
                  {"连接你的微信读书"}
                </h2>
                <p className="mb-5 text-[13px] text-muted-foreground text-center">
                  {"输入 API Key 验证后即可开始使用"}
                </p>
                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="输入你的微信读书 API Key"
                      value={apiKey}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="h-11 pl-10 bg-card border-0 shadow-sm text-[15px]"
                    />
                  </div>
                  {error && <p className="text-[13px] text-destructive">{error}</p>}
                  <Button
                    type="submit"
                    disabled={!apiKey.trim() || loading}
                    className="h-11 text-[15px] font-medium shadow-sm"
                  >
                    {loading ? '验证中...' : '开始使用'}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
                <div className="mt-5 w-full rounded-xl bg-muted/50 p-4">
                  <h3 className="text-[13px] font-medium text-foreground mb-2">{"如何获取 API Key？"}</h3>
                  <ol className="flex flex-col gap-1 text-[13px] text-muted-foreground leading-relaxed">
                    <li>{"1. 打开微信读书 App"}</li>
                    <li>{"2. 进入「我」→「设置」"}</li>
                    <li>{"3. 找到「微信读书 Skill」或相关选项"}</li>
                    <li>{"4. 滚到底部复制生成的 API Key"}</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl text-balance">
                  {"准备好开始了吗？"}
                </h2>
                <p className="mt-3 mb-6 text-[15px] leading-relaxed text-muted-foreground">
                  {"只需一个 API Key，你的全部微信读书数据将在此呈现"}
                </p>
                <Button size="lg" className="h-11 px-7 text-[15px] font-medium shadow-sm" onClick={() => setShowSetup(true)}>
                  {"立即连接"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-5xl px-5 py-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="readNeo" className="h-5 w-5 rounded" />
              <span className="text-[13px] font-medium text-muted-foreground">readNeo</span>
            </div>
            <p className="text-[12px] text-muted-foreground text-center">
              {"readNeo 是一个开源项目，数据仅存储在你的浏览器本地。"}
            </p>
            <a
              href="https://github.com/extrastu/readneo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              {"GitHub"}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
