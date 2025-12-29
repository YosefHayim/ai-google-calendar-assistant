/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(jsx|tsx)$/,
      exclude: /node_modules/,
      enforce: "pre",
      use: "@dyad-sh/nextjs-webpack-component-tagger",
    });

    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  reactStrictMode: true,
};

export default nextConfig;
