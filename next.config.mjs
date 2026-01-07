/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure Prisma generated files (including binaries) are included in all serverless functions
  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/generated/prisma/**'],
    '/posts/**/*': ['./lib/generated/prisma/**'],
    '/login/**/*': ['./lib/generated/prisma/**'],
    '/**': ['./lib/generated/prisma/**'],
  },
  // Set the root for file tracing
  outputFileTracingRoot: process.cwd(),
  // Empty turbopack config to silence warnings about webpack config
  turbopack: {},
}

export default nextConfig