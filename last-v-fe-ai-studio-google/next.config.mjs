/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path((?!api|_next/static|favicon.ico|.*\\..*).*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;