import type { NextConfig } from "next";

/**
 * Proteção do endereço oficial: um build de PRODUÇÃO na Vercel só segue com
 * NEXT_PUBLIC_SITE_URL válida (https, domínio próprio, sem localhost ou
 * .vercel.app). Prévias e o CI apenas avisam, para não interromper builds.
 */
function siteUrlProblems(value: string | undefined): string[] {
  const v = (value ?? "").trim();
  if (!v) return ["NEXT_PUBLIC_SITE_URL não está definida"];
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return [`NEXT_PUBLIC_SITE_URL não é um endereço válido: ${v}`];
  }
  const p: string[] = [];
  if (u.protocol !== "https:") p.push("NEXT_PUBLIC_SITE_URL precisa usar https://");
  if (/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(u.hostname)) p.push("NEXT_PUBLIC_SITE_URL não pode ser localhost");
  if (u.hostname.endsWith(".vercel.app")) p.push("NEXT_PUBLIC_SITE_URL de produção não pode ser .vercel.app");
  if (u.pathname !== "/" || u.search || u.hash) p.push("NEXT_PUBLIC_SITE_URL deve conter só o domínio, sem caminho");
  return p;
}

if (process.env.VERCEL_ENV === "production") {
  const problems = siteUrlProblems(process.env.NEXT_PUBLIC_SITE_URL);
  if (problems.length) {
    throw new Error(`Build de produção interrompido — endereço oficial inválido:\n- ${problems.join("\n- ")}`);
  }
} else if (process.env.VERCEL && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn("[backstag] NEXT_PUBLIC_SITE_URL ausente nesta prévia: usando o endereço da própria prévia.");
}

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
