'use client'

import { useWeReadStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Key,
  LogOut,
  Shield,
  Flower2,
  Database,
  Check,
  ExternalLink,
  Info,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

export function SettingsView() {
  const {
    apiKey,
    setApiKey,
    clearApiKey,
    flomoApiUrl,
    setFlomoApiUrl,
    clearFlomoApiUrl,
    notionToken,
    notionDatabaseId,
    setNotionConfig,
    clearNotionConfig,
  } = useWeReadStore()

  const [newKey, setNewKey] = useState('')
  const [keySaved, setKeySaved] = useState(false)

  const [newFlomoUrl, setNewFlomoUrl] = useState('')
  const [flomoSaved, setFlomoSaved] = useState(false)

  const [newNotionToken, setNewNotionToken] = useState('')
  const [newNotionDbId, setNewNotionDbId] = useState('')
  const [notionSaved, setNotionSaved] = useState(false)

  function handleUpdateKey() {
    if (!newKey.trim()) return
    setApiKey(newKey.trim())
    setNewKey('')
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  function handleSaveFlomo() {
    if (!newFlomoUrl.trim()) return
    setFlomoApiUrl(newFlomoUrl.trim())
    setNewFlomoUrl('')
    setFlomoSaved(true)
    setTimeout(() => setFlomoSaved(false), 2000)
  }

  function handleSaveNotion() {
    if (!newNotionToken.trim() || !newNotionDbId.trim()) return
    setNotionConfig(newNotionToken.trim(), newNotionDbId.trim())
    setNewNotionToken('')
    setNewNotionDbId('')
    setNotionSaved(true)
    setTimeout(() => setNotionSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {"设置"}
        </h1>
        <p className="mt-1 text-muted-foreground">{"管理你的账户、同步配置与偏好"}</p>
      </div>

      {/* API Key */}
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
                {keySaved ? '已保存' : '更新'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flomo */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Flower2 className="h-4 w-4 text-chart-2" />
            {"Flomo 同步配置"}
          </CardTitle>
          <CardDescription>
            {"将微信读书的划线和笔记同步到 Flomo"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Help section */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="flex flex-col gap-2 text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground">{"如何获取 Flomo API？"}</p>
                <ol className="flex flex-col gap-1.5 list-decimal pl-4">
                  <li>
                    {"打开 "}
                    <a
                      href="https://flomoapp.com/mine?source=incoming_webhook"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {"Flomo 设置页面"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>{"在左侧菜单找到「API」选项"}</li>
                  <li>{"复制你的专属 API 地址（格式如：https://flomoapp.com/iwh/xxx/yyy）"}</li>
                  <li>{"将完整的 API 地址粘贴到下方输入框"}</li>
                </ol>
                <p className="text-xs text-muted-foreground/80">
                  {"注意：Flomo 免费版每日 API 调用有限制。同步大量笔记时请留意配额。"}
                </p>
              </div>
            </div>
          </div>

          {flomoApiUrl && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-chart-2" />
              <span className="text-sm text-chart-2">{"已配置"}</span>
              <code className="ml-2 flex-1 truncate rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                {`${flomoApiUrl.slice(0, 30)}...`}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={clearFlomoApiUrl}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="https://flomoapp.com/iwh/xxx/yyy"
              value={newFlomoUrl}
              onChange={(e) => setNewFlomoUrl(e.target.value)}
              className="bg-card border-border font-mono text-sm"
            />
            <Button onClick={handleSaveFlomo} disabled={!newFlomoUrl.trim()}>
              {flomoSaved ? '已保存' : '保存'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notion */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4 text-chart-3" />
            {"Notion 同步配置"}
          </CardTitle>
          <CardDescription>
            {"将微信读书的划线和笔记同步到 Notion 数据库"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Help section */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="flex flex-col gap-2 text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground">{"如何配置 Notion 同步？"}</p>
                <p className="font-medium text-foreground/80">{"第一步：创建 Integration"}</p>
                <ol className="flex flex-col gap-1.5 list-decimal pl-4">
                  <li>
                    {"打开 "}
                    <a
                      href="https://www.notion.so/my-integrations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {"Notion Integrations"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>{"点击「New integration」创建一个新集成"}</li>
                  <li>{"名称填写 ReadFlow，类型选择 Internal"}</li>
                  <li>{"创建后复制 Internal Integration Secret（以 ntn_ 开头）"}</li>
                </ol>
                <p className="font-medium text-foreground/80 mt-2">{"第二步：创建数据库并授权"}</p>
                <ol className="flex flex-col gap-1.5 list-decimal pl-4">
                  <li>{"在 Notion 中新建一个 Full Page Database"}</li>
                  <li>
                    {"添加以下属性列："}
                    <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Title</span>
                    {"（标题）、"}
                    <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Author</span>
                    {"（文本）、"}
                    <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Type</span>
                    {"（选择，值：划线/想法）、"}
                    <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Content</span>
                    {"（富文本）、"}
                    <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Chapter</span>
                    {"（文本）"}
                  </li>
                  <li>{"点击数据库右上角「...」→「Connections」→ 搜索并添加 ReadFlow"}</li>
                  <li>{"复制数据库链接，提取其中的 Database ID（32位字符串，格式如 abc123...def456）"}</li>
                </ol>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  {"数据库链接格式：https://notion.so/xxx?v=yyy，其中 xxx 的最后 32 位即为 Database ID。"}
                </p>
              </div>
            </div>
          </div>

          {notionToken && notionDatabaseId && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-chart-2" />
              <span className="text-sm text-chart-2">{"已配置"}</span>
              <code className="ml-2 truncate rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                {`ntn_...${notionToken.slice(-4)}`}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={clearNotionConfig}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Input
              type="password"
              placeholder="Internal Integration Secret (ntn_...)"
              value={newNotionToken}
              onChange={(e) => setNewNotionToken(e.target.value)}
              className="bg-card border-border font-mono text-sm"
            />
            <Input
              placeholder="Database ID (32位字符串)"
              value={newNotionDbId}
              onChange={(e) => setNewNotionDbId(e.target.value)}
              className="bg-card border-border font-mono text-sm"
            />
            <Button
              onClick={handleSaveNotion}
              disabled={!newNotionToken.trim() || !newNotionDbId.trim()}
              className="w-fit"
            >
              {notionSaved ? '已保存' : '保存配置'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            {"隐私与安全"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {"你的 API Key 及同步配置仅存储在浏览器本地，不会上传至任何服务器。所有数据请求均通过服务端代理转发，确保安全性。"}
          </p>
          <Button
            variant="destructive"
            className="w-fit"
            onClick={clearApiKey}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {"退出并清除所有数据"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
