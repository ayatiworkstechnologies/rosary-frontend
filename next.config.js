import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(
  fileURLToPath(import.meta.url)
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },

  async rewrites() {
    // LOCAL_BACKEND_URL is a local-development / E2E-test override only.
    // Production (Vercel) must keep proxying to the real backend.
    const backendUrl =
      process.env.LOCAL_BACKEND_URL ||
      "http://89.167.92.220:8016";

    return [
      {
        source: "/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;