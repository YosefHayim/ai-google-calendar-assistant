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
  cacheComponents: true,
  // Enable Turbopack (default in Next.js 16) with empty config to silence warning
  turbopack: {
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  // React Compiler for automatic memoization (moved from experimental in Next.js 16)
  reactCompiler: true,
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
