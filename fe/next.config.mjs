import withBundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  webpack: (config) => {
    if (isDev) {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: '@ternary-std/nextjs-webpack-component-tagger',
      })
    }
    return config
  },
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    optimizeCss: true,
    scrollRestoration: true,
    swcPlugins: isDev
      ? [
          [
            'swc-plugin-component-annotate',
            {
              dataComponent: true,
              dataElement: true,
              dataSourceFile: true,
            },
          ],
        ]
      : [],
  },
  reactCompiler: true,
  reactStrictMode: true,
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ally-ai-google-calendar.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://accounts.google.com https://www.googletagmanager.com https://lmsqueezy.com",
              "style-src 'self' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://api.openai.com https://raw.githubusercontent.com https://*.awsapprunner.com https://*.ingest.sentry.io https://*.sentry.io https://*.posthog.com https://be.askally.io https://lmsqueezy.com",
              "frame-src 'self' https://accounts.google.com",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(self)',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // Performance headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // Static assets caching
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images caching
      {
        source: '/api/(.*).(jpg|jpeg|png|gif|webp|avif|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(
  process.env.ANALYZE === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig,
  {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'individual-kl',

  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: (config, { dev }) => {
    // Disable source maps in production since Sentry handles them
    if (!dev) {
      config.devtool = false
    }

    // Aggressive optimizations for production
    if (!dev) {
      // Enable webpack optimizations
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        concatenateModules: true,
        flagIncludedChunks: true,
        occurrenceOrder: true,
        providedExports: true,
        usedExports: true,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate large vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Separate React and related libraries
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|framer-motion|@radix-ui)[\\/]/,
              name: 'react-vendor',
              chunks: 'all',
              priority: 20,
            },
            // Separate chart libraries
            charts: {
              test: /[\\/]node_modules[\\/](recharts|d3|@tsparticles)[\\/]/,
              name: 'charts-vendor',
              chunks: 'all',
              priority: 15,
            },
            // Separate UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](lucide-react|@headlessui|class-variance-authority|clsx|tailwind-merge)[\\/]/,
              name: 'ui-vendor',
              chunks: 'all',
              priority: 15,
            },
          },
        },
      }

      // Add terser options for better minification
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.options && minimizer.options.terserOptions) {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions.compress,
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
              },
              mangle: {
                safari10: true,
              },
            }
          }
        })
      }
    }

    return config
  },

  sentry: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
})
