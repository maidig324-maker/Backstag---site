import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.fullName} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagem de compartilhamento gerada no build (sem imagens remotas).
 * Quando a logo oficial estiver disponível, você pode substituir este
 * arquivo por um /src/app/opengraph-image.png estático com a marca.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(ellipse 60% 70% at 70% 20%, rgba(215,168,62,0.16), rgba(9,9,11,1) 70%)",
          backgroundColor: "#09090b",
          color: "#f5f5f2",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 10, fontFamily: "sans-serif", fontWeight: 600 }}>
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.02 }}>
          <span>Sua empresa não precisa apenas aparecer.</span>
          <span style={{ color: "#f0c766", fontStyle: "italic" }}>Precisa funcionar, evoluir e crescer.</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(245,245,242,0.2)",
            paddingTop: 24,
            fontSize: 24,
            fontFamily: "sans-serif",
            color: "rgba(245,245,242,0.75)",
          }}
        >
          <span>{site.positioning}</span>
          <span style={{ color: "#d7a83e" }}>{site.tagline}</span>
        </div>
      </div>
    ),
    size,
  );
}
