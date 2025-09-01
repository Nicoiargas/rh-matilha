/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração mínima para estabilidade
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Desabilitar otimizações experimentais
  experimental: {
    optimizePackageImports: [],
  },
}

module.exports = nextConfig
