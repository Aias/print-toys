import type { NextConfig } from 'next';

const config: NextConfig = {
  serverExternalPackages: ['usb', 'canvas'],
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  }
};

export default config;
