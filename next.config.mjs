/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
      { source: "/healthz", destination: `${apiUrl}/healthz` },
      { source: "/readyz", destination: `${apiUrl}/readyz` },
    ]
  },
}

export default nextConfig
