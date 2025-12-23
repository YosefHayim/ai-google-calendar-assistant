import type { NextConfig } from "next";
import componentTagger from "@dhiwise/component-tagger";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: [
        {
          loader: componentTagger,
          options: {
            verbose: true,
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
