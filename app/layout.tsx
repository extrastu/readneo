import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://readneo.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'readNeo - 微信读书数据面板',
    template: '%s | readNeo',
  },
  description:
    '连接微信读书，可视化你的阅读数据。管理书架、追踪阅读统计、导出笔记划线，支持同步到 Flomo 和 Notion。',
  keywords: [
    '微信读书',
    'WeRead',
    '阅读统计',
    '阅读数据',
    '书架管理',
    '笔记导出',
    '划线导出',
    'Flomo',
    'Notion',
    '阅读习惯',
    '读书笔记',
  ],
  authors: [{ name: 'readNeo', url: siteUrl }],
  creator: 'readNeo',
  publisher: 'readNeo',
  generator: 'Next.js',
  applicationName: 'readNeo',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    siteName: 'readNeo',
    title: 'readNeo - 微信读书数据面板',
    description:
      '连接微信读书，可视化你的阅读数据。管理书架、追踪阅读统计、导出笔记划线，支持同步到 Flomo 和 Notion。',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'readNeo - 微信读书数据面板',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'readNeo - 微信读书数据面板',
    description:
      '连接微信读书，可视化你的阅读数据。管理书架、追踪阅读统计、导出笔记划线。',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.jpg', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  category: 'productivity',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="bg-background">
      <head>
        <link rel="preconnect" href="https://i.weread.qq.com" />
        <link rel="dns-prefetch" href="https://i.weread.qq.com" />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
