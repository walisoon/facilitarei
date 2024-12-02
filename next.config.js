/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['qkimxruewcensnfllvv.supabase.co'],
  },
  async rewrites() {
    return [
      {
        source: '/api/supabase/:path*',
        destination: 'https://qkimxruewcensnfllvv.supabase.co/:path*',
      },
    ];
  },
}

module.exports = nextConfig
