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
          destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
        },
      ]
    }

    return [];
  },
};

module.exports = nextConfig;