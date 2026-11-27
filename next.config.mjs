const isStaticExport =
  process.env.CF_PAGES === '1' || process.env.NEXT_EXPORT === 'true'

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
