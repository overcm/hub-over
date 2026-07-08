import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // O middleware ("proxy") do Next.js armazena o corpo da requisição em memória
    // com limite padrão de 10MB, o que truncaria silenciosamente uploads de
    // materiais maiores feitos pelas páginas do admin (o upload de vídeo passa
    // por /api, que já é excluído do proxy pelo matcher do middleware.ts).
    proxyClientMaxBodySize: "200mb",
  },
};

export default nextConfig;
