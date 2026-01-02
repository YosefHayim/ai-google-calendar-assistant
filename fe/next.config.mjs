/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    if (process.env.NODE_ENV === 'production') return config
    config.module.rules.push({
      test: /\.(jsx|tsx)$/,
      exclude: /node_modules/,
      enforce: 'pre',
      use: '@dyad-sh/nextjs-webpack-component-tagger',
    })

    return config
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
