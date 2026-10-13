import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Somente imagens locais (pasta /public). Nenhuma dependência de imagens remotas.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Fora de divulgação até NEXT_PUBLIC_SITE_INDEXING=true
          ...(process.env.NEXT_PUBLIC_SITE_INDEXING === "true"
            ? []
            : [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]),
        ],
      },
    ];
  },
};

export default nextConfig;
