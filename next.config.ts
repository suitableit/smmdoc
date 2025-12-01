/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@/components', '@/hooks', '@/lib'],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };

      config.resolve.symlinks = false;
    }

    return config;
  },

  turbopack: {},

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),

  async rewrites() {
    return [
      {
        source: '/blog/:slug',
        destination: '/blogs/:slug',
      },
    ];
  },
};

module.exports = nextConfig;
