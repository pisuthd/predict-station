/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Don't bundle native modules in browser
    // This prevents bare-* and @qvac from root node_modules causing issues
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        // Native modules from root package.json (CLI deps)
        /^bare-/,
        /^@qvac/,
      ];
    }
    return config;
  },
}

module.exports = nextConfig