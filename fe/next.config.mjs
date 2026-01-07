/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  experimental: {
    swcPlugins:
      process.env.NODE_ENV === 'development'
        ? [
            [
              'swc-plugin-component-annotate',
              {
                dataComponent: true,
                dataElement: false,
                dataSourceFile: true,
              },
            ],
          ]
        : [],
  },
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
