import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Docker deployments
  // output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
    ],
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
