import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['usb', 'canvas'],
    // Enable after() API for fire-and-forget printing
    after: true,
  },
}

export default config
