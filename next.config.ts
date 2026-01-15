import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://cuandaz.com',
  },
};

export default nextConfig;
