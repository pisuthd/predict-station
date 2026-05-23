/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Polyfill for browser environment
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
      };
      
      // Provide global shims
      config.plugins.push(
        new (require('webpack').ProvidePlugin)({
          process: 'process/browser',
        })
      );
    }
    return config;
  },
}

module.exports = nextConfig