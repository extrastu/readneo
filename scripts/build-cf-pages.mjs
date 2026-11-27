import { existsSync, renameSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const rootDir = process.cwd()
const apiDir = join(rootDir, 'app', 'api')
const tempApiDir = join(rootDir, '.cf-api-backup')

let apiMoved = false

/**
 * 将构建期间临时移出的 app/api 目录还原到原位置
 * 副作用：修改本地文件系统目录路径，确保异常或中断退出时不遗留脏状态
 */
function restoreApiDir() {
  if (!apiMoved) return
  if (existsSync(tempApiDir) && !existsSync(apiDir)) {
    renameSync(tempApiDir, apiDir)
  }
  apiMoved = false
}

/**
 * 执行 Cloudflare Pages 静态导出构建
 * 由于 Next.js output: 'export' 不支持动态 POST Route Handler，构建期间会临时移出 app/api，
 * 线上 /api/* 请求由根目录 functions/api/*（Cloudflare Pages Functions）接管。
 */
function runCloudflarePagesBuild() {
  if (existsSync(tempApiDir)) {
    console.error('[build:cf] 发现残留目录 .cf-api-backup，请先确认 app/api 状态后再重试。')
    process.exit(1)
  }

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
      restoreApiDir()
      process.exit(1)
    })
  }

  try {
    if (existsSync(apiDir)) {
      renameSync(apiDir, tempApiDir)
      apiMoved = true
    }

    const result = spawnSync('pnpm', ['exec', 'next', 'build'], {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        CF_PAGES: '1',
        NEXT_EXPORT: 'true',
        NEXT_PUBLIC_SITE_URL:
          process.env.NEXT_PUBLIC_SITE_URL || 'https://readneo.pages.dev',
      },
    })

    if (result.error) {
      throw result.error
    }

    if (result.status !== 0) {
      process.exit(result.status ?? 1)
    }
  } finally {
    restoreApiDir()
  }
}

runCloudflarePagesBuild()
