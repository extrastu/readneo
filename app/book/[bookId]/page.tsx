import { BookDetailClient } from './book-detail-client'

/**
 * 为 Next.js 静态导出生成占位路由参数
 * 配合 Cloudflare Pages 的 _redirects 规则，将任意 /book/:bookId 请求重写到占位页并由客户端解析真实 ID
 * @returns 静态占位参数列表
 */
export function generateStaticParams() {
  return [{ bookId: '_' }]
}

/**
 * 书籍详情页服务端入口组件，渲染客户端详情容器
 */
export default function BookDetailPage() {
  return <BookDetailClient />
}
