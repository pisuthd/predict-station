/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // ONLY resolve frontend node_modules first
    config.resolve.modules = [__dirname + '/node_modules', 'node_modules']

    // Prevent server/native packages in browser
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    }

    return config
  },
}

module.exports = nextConfig