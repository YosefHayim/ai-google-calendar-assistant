import type { NextConfig } from "next";
import componentTaggerLoader from "@dhiwise/component-tagger/nextLoader";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Only apply to client-side code
    if (!isServer) {
      // Find the existing rule for .tsx and .jsx files
      const rules = config.module?.rules || [];
      
      // Find the rule that handles .tsx/.jsx files (usually the one with 'tsx' or 'jsx' in test)
      const tsxRule = rules.find(
        (rule: any) =>
          rule.test &&
          (rule.test.toString().includes("tsx") ||
            rule.test.toString().includes("jsx") ||
            rule.test.toString().includes("ts") ||
            rule.test.toString().includes("js"))
      );

      if (tsxRule && Array.isArray(tsxRule.use)) {
        // Add the component tagger loader before the existing loaders
        tsxRule.use.unshift({
          loader: componentTaggerLoader,
          options: {
            verbose: process.env.NODE_ENV === "development",
            excludeDirectories: ["node_modules", ".next"],
          },
        });
      }
    }

    return config;
  },
};

export default nextConfig;

