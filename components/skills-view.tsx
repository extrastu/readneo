'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Lightbulb,
  BookOpen,
  Mic,
  Search,
  Brain,
  Sparkles,
  FileText,
  Code,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'

const skills = [
  {
    id: 'flomo',
    title: '自动生成 flomo 卡片',
    description: '把微信读书划线整理成 flomo 风格短卡片，支持主题聚类和个人理解补充',
    icon: FileText,
    color: 'bg-chart-2/10 text-chart-2',
    prompt: `帮我整理最近 7 天的微信读书划线：

要求：
- 按主题聚类
- 每条不超过 120 字
- 保留原句
- 增加一句自己的理解
- 输出 flomo 风格 Markdown`,
    variations: ['今日阅读 digest', '本周最有启发的 5 条', '反复出现的观点'],
  },
  {
    id: 'coach',
    title: 'AI 读书教练',
    description: '分析你的阅读习惯，给出个性化建议和阅读人格分析',
    icon: Brain,
    color: 'bg-chart-3/10 text-chart-3',
    prompt: `分析我最近 3 个月的阅读习惯：

- 我最关注什么主题
- 哪些书半途放弃
- 哪些作者出现频率最高
- 我更偏向方法论还是叙事
- 给我下一阶段阅读建议`,
    variations: ['阅读人格分析', '知识偏食检测', '重复阅读模式'],
  },
  {
    id: 'content',
    title: '内容创作助手',
    description: '基于阅读划线生成公众号、小红书、Newsletter 等内容',
    icon: Sparkles,
    color: 'bg-chart-5/10 text-chart-5',
    prompt: `基于我最近读的书的划线，
生成一篇小红书风格内容：

要求：
- 不像 AI 写的
- 有个人表达
- 保留 3 条原始金句
- 标题要像爆款`,
    variations: ['Newsletter 周刊', '播客提纲', '视频脚本'],
  },
  {
    id: 'search',
    title: '个人知识搜索引擎',
    description: '搜索你过去几年读过的所有书，变成可搜索知识库',
    icon: Search,
    color: 'bg-chart-1/10 text-chart-1',
    prompt: `帮我找：
- 关于产品增长
- 用户心理
- 创业焦虑

相关的所有划线
并做总结`,
    variations: ['关键词检索', '主题聚合', '跨书对比'],
  },
  {
    id: 'podcast',
    title: 'AI 播客生成',
    description: '把划线整理成播客稿或口语化总结，适合通勤收听',
    icon: Mic,
    color: 'bg-chart-4/10 text-chart-4',
    prompt: `把我今天的划线，
整理成一段 5 分钟播客稿

要求：
- 口语化表达
- 有观点有思考
- 适合通勤听`,
    variations: ['每日阅读播报', '睡前复习', '通勤 AI 电台'],
  },
  {
    id: 'reverse',
    title: '反向读书分析',
    description: '让 AI 分析"你"而不是书，了解你的阅读背后的思考',
    icon: Lightbulb,
    color: 'bg-primary/10 text-primary',
    prompt: `根据我过去一年的阅读记录：

- 我在焦虑什么
- 我反复思考什么
- 我价值观的变化
- 哪些主题越来越频繁`,
    variations: ['阅读情绪变化', '关注点迁移', '思维模式'],
  },
  {
    id: 'dev',
    title: '开发者工作流',
    description: '把技术书籍划线整理成 checklist、规范或最佳实践',
    icon: Code,
    color: 'bg-chart-3/10 text-chart-3',
    prompt: `读取我《重构》的所有划线，
整理成：
- React 重构 checklist
- 前端工程实践
- 可执行建议`,
    variations: ['代码规范', '设计模式', '团队内部规范'],
  },
  {
    id: 'summary',
    title: '智能书摘总结',
    description: '按章节或主题聚合划线，生成结构化总结',
    icon: BookOpen,
    color: 'bg-chart-2/10 text-chart-2',
    prompt: `帮我整理《纳瓦尔宝典》的所有划线：

要求：
- 按章节分组
- 提炼核心观点
- 标注最重要的 3 条
- 给出行动建议`,
    variations: ['章节总结', '核心观点', '行动清单'],
  },
]

export function SkillsView() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleCopy(id: string, prompt: string) {
    await navigator.clipboard.writeText(prompt)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{"Skill 灵感"}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {"探索微信读书 Skill 的创意用法，复制 Prompt 到 AI 助手中使用"}
        </p>
      </div>

      {/* Intro Card */}
      <Card className="border shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{"什么是微信读书 Skill？"}</span>
          </div>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {"微信读书 Skill 把你的阅读数据（书架、划线、笔记、阅读进度）开放给 AI 使用。你可以连接 Claude、ChatGPT、Codex 等工具，让 AI 成为你的「第二大脑阅读层」。"}
          </p>
          <a
            href="https://weread.qq.com/r/weread-skills"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline w-fit"
          >
            {"了解更多"}
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      {/* Skills Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {skills.map((skill) => (
          <Card key={skill.id} className="border shadow-sm group">
            <CardHeader className="pb-2 px-5 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${skill.color}`}>
                    <skill.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-[15px] font-semibold text-foreground">
                    {skill.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-3">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {skill.description}
              </p>

              {/* Prompt Preview */}
              <div className="relative">
                <pre className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto scrollbar-thin">
                  {skill.prompt}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopy(skill.id, skill.prompt)}
                >
                  {copiedId === skill.id ? (
                    <Check className="h-3.5 w-3.5 text-chart-2" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* Variations */}
              <div className="flex flex-wrap gap-1.5">
                {skill.variations.map((v, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-[11px] font-medium text-secondary-foreground"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Tips */}
      <Card className="border shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">{"使用技巧"}</h3>
          <ul className="space-y-2 text-[13px] text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">{"1."}</span>
              <span>{"在支持 MCP 的 AI 工具中连接微信读书 Skill"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">{"2."}</span>
              <span>{"复制上面的 Prompt 模板，根据需要修改"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">{"3."}</span>
              <span>{"AI 会自动读取你的阅读数据并生成结果"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">{"4."}</span>
              <span>{"可以导出到 flomo、Notion、Obsidian 等工具"}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
