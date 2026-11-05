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
    // Production (Vercel) routes through the TLS nginx domain; the app and
    // the backend exchange paths 1:1 (api.rosarychennai.com proxies
    // location / -> 127.0.0.1:8016), so no path prefix rewrite is needed.
    const backendUrl =
      process.env.LOCAL_BACKEND_URL ||
      "https://www.api.rosarychennai.com";

    return [
      {
        source: "/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;