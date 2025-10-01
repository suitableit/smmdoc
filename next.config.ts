/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize Fast Refresh behavior
  experimental: {
    // Reduce Fast Refresh sensitivity
    optimizePackageImports: ['@/components', '@/hooks', '@/lib'],
  },
  
  // Webpack configuration for better development experience
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    if (dev && !isServer) {
      // Reduce webpack polling for better performance
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      
      // Optimize module resolution
      config.resolve.symlinks = false;
    }
    
    return config;
  },
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Development server configuration
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // Period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 25 * 1000,
      // Number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 2,
    },
  }),
};

module.exports = nextConfig;