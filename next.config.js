/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações para produção
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Configurações de build
  output: 'standalone',
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Configurações experimentais
  experimental: {
    serverComponentsExternalPackages: ['whatsapp-web.js', 'puppeteer']
  },
  
  // Webpack customizado
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('whatsapp-web.js', 'puppeteer');
    }
    return config;
  }
}

module.exports = nextConfig