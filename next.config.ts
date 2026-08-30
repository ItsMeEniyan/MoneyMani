import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.vercel.app", "localhost:3000"],
    },
  },
}

export default nextConfig
