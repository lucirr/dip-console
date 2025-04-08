/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://dip-api:8087/api/v1/:path*',
        },
        {
          source: '/sapi/v1/:path*',
          destination: 'http://dip-api:8087/sapi/v1/:path*',
        },
      ]
    }

    return [];
  },
};

module.exports = nextConfig;