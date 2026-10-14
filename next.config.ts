import type { NextConfig } from "next";

// Servidor do adk2 com o agente Lés (página dele em /les; API em /api/les/...).
// Para usar um adk2 local (go run ./adk2 -web): AGENTE_URL=http://127.0.0.1:8787
const agente = (
  process.env.AGENTE_URL ?? "https://agentsadk2-production.up.railway.app"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    deviceSizes: [360, 480, 640, 828, 1080, 1440, 1920],
    qualities: [60, 75, 85],
  },
  experimental: {
    optimizePackageImports: ["motion", "lucide-react", "@react-three/drei"],
  },
  async rewrites() {
    return [{ source: "/agente/:path*", destination: `${agente}/:path*` }];
  },
};

export default nextConfig;
