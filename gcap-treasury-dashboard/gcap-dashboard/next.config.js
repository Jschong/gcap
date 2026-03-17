/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow server-side fetch to external domains
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=1800, stale-while-revalidate=3600' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
