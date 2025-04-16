/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://dip-api:8087/api/v1/:path*',
          has: [
            {
              type: 'header',
              key: 'Authorization',
            },
          ],
        },
        {
          source: '/sapi/v1/:path*',
          destination: 'http://dip-api:8087/sapi/v1/:path*',
          has: [
            {
              type: 'header',
              key: 'Authorization',
            },
          ],
        },
      ]
    }

    return [];
  },
};

module.exports = nextConfig;