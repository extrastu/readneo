'use client'

import { useWeReadStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Key, LogOut, Shield } from 'lucide-react'
import { useState } from 'react'

export function SettingsView() {
  const { apiKey, setApiKey, clearApiKey } = useWeReadStore()
  const [newKey, setNewKey] = useState('')
  const [saved, setSaved] = useState(false)

  function handleUpdateKey() {
    if (!newKey.trim()) return
    setApiKey(newKey.trim())
    setNewKey('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {"设置"}
        </h1>
        <p className="mt-1 text-muted-foreground">{"管理你的账户与偏好"}</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4 text-primary" />
            {"API Key 管理"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">{"当前 API Key"}</label>
            <code className="rounded-lg bg-muted px-3 py-2 text-sm font-mono text-foreground">
              {apiKey ? `${apiKey.slice(0, 8)}${'*'.repeat(24)}${apiKey.slice(-4)}` : '未设置'}
            </code>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">{"更换 API Key"}</label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="输入新的 API Key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="bg-card border-border"
              />
              <Button onClick={handleUpdateKey} disabled={!newKey.trim()}>
                {saved ? '已保存' : '更新'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            {"隐私与安全"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {"你的 API Key 仅存储在浏览器本地，不会上传至任何服务器。所有数据请求均通过服务端代理转发，确保安全性。"}
          </p>

          <Button
            variant="destructive"
            className="w-fit"
            onClick={clearApiKey}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {"退出并清除数据"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
