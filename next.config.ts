import type { NextConfig } from "next";

const nextConfig: any = {
  typescript: {
    // Игнорировать ошибки TypeScript при сборке на Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Игнорировать ошибки ESLint (линтера) при сборке на Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
