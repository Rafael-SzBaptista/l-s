import type { NextConfig } from "next";

// Endereço do adk2 (go run ./adk2 -web). Em produção, defina AGENTE_URL.
const agente = (process.env.AGENTE_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");

const nextConfig: NextConfig = {
  agentRules: false,
  async rewrites() {
    return [{ source: "/agente/:path*", destination: `${agente}/:path*` }];
  },
};

export default nextConfig;
