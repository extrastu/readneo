'use client'

import { useState } from 'react'
import { useWeReadStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Key, ArrowRight } from 'lucide-react'

export function SetupScreen() {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setApiKey = useWeReadStore((s) => s.setApiKey)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!key.trim()) return

    setLoading(true)
    setError('')

    try {
      // Validate by calling /shelf/sync — a known valid endpoint per SKILL spec
      const res = await fetch('/api/weread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key.trim(), apiName: '/shelf/sync' }),
      })

      if (!res.ok) {
        throw new Error('API Key 验证失败，请检查后重试')
      }

      setApiKey(key.trim())
    } catch {
      setError('API Key 验证失败，请检查后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <img src="/icon.svg" alt="readNeo" className="h-16 w-16 rounded-2xl" />
          <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance">
            readNeo
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {"连接你的微信读书账户，开启全新的阅读数据体验"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="输入你的微信读书 API Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="pl-10 h-12 bg-card border-border"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={!key.trim() || loading}
            className="h-12 text-base font-medium"
          >
            {loading ? '验证中...' : '开始使用'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <div className="mt-8 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-2">{"如何获取 API Key？"}</h3>
          <ol className="flex flex-col gap-1.5 text-sm text-muted-foreground leading-relaxed">
            <li>{"1. 打开微信读书 App"}</li>
            <li>{"2. 进入「我」→「设置」"}</li>
            <li>{"3. 找到「微信读书 Skill」或相关选项"}</li>
            <li>{"4. 滚到底部复制生成的 API Key"}</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
