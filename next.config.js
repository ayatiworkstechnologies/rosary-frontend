/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination:
          "http://89.167.92.220:8016/:path*",
      },
    ];
  },
};

export default nextConfig;