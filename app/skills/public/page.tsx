'use client'

import Link from 'next/link'
import { SkillsView } from '@/components/skills-view'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Github } from 'lucide-react'

export default function PublicSkillsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/icon.svg" alt="readNeo" className="h-8 w-8 rounded-lg shadow-sm" />
              <span className="text-[15px] font-semibold tracking-tight text-foreground">readNeo</span>
            </Link>
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
            <Link href="/">
              <Button size="sm" className="h-9 px-4 text-[13px] font-medium">
                {"开始使用"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {"返回首页"}
          </Link>
        </div>
        <SkillsView />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-5xl px-5 py-6">
          <p className="text-center text-xs text-muted-foreground">
            {"readNeo 是一个开源项目，数据通过微信读书 Skill API 获取，仅存储在你的浏览器本地。"}
          </p>
        </div>
      </footer>
    </div>
  )
}
