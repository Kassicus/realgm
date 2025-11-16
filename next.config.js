/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // For Electron compatibility
  images: {
    unoptimized: true // Required for static export
  }
}

module.exports = nextConfig
