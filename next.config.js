/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ This fixes the "multiple lockfiles / workspace root" warning
  outputFileTracingRoot: __dirname,

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      'porto/internal': false,
      'porto': false,
      'crypto': false,
      '@x402/evm/upto/client': false,
      '@x402/evm/exact/client': false,
      '@x402/core/client': false,
      '@x402/svm/exact/client': false,
      '@x402/evm': false,
      'accounts': false,
      '@farcaster/miniapp-sdk': false,
    }
    return config
  },

  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
