/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Don't bundle native modules in browser
    if (!isServer) {
      // Externalize entire bare-* scope
      config.externals.push({
        'bare-abort': 'commonjs bare-abort',
        'bare-fs': 'commonjs bare-fs',
        'bare-os': 'commonjs bare-os',
        'bare-signals': 'commonjs bare-signals',
        'bare-tty': 'commonjs bare-tty',
        'bare-stdio': 'commonjs bare-stdio',
        'process': 'commonjs process',
        '@qvac/sdk': 'commonjs @qvac/sdk',
      });
    }
    return config;
  },
}

module.exports = nextConfig