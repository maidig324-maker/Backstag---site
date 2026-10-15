import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { hero2026 } from "@/content/hero-2026";

export const alt = `${site.fullName} — ${hero2026.headline.join(" ")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Busca a Oswald (fonte dos títulos) no build; se falhar, usa a fonte padrão. */
async function loadOswald(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Oswald:wght@500&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

/** Imagem que aparece ao compartilhar o link (WhatsApp, Instagram, LinkedIn). */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/backstag-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const [a, b] = hero2026.headline;
  const headline = `${a} ${b}`.toUpperCase();
  const font = await loadOswald(headline + hero2026.concept.toUpperCase());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(ellipse 55% 75% at 85% 15%, rgba(215,168,62,0.22), rgba(9,9,11,0) 70%), radial-gradient(ellipse 50% 60% at 0% 100%, rgba(215,168,62,0.08), rgba(9,9,11,0) 70%)",
          color: "#f5f5f2",
        }}
      >
        {/* logo oficial */}
        <img src={logoSrc} width={360} height={101} alt="" />

        <div style={{ display: "flex", flexDirection: "column", fontFamily: font ? "Oswald" : "sans-serif", fontSize: 128, lineHeight: 0.95, letterSpacing: 1 }}>
          <span>{a.toUpperCase()}</span>
          <span style={{ display: "flex" }}>
            {b.replace(/além\.?/i, "").toUpperCase()}
            <span style={{ color: "#f0c766", marginLeft: 28 }}>ALÉM.</span>
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: "rgba(245,245,242,0.78)",
            fontFamily: "sans-serif",
          }}
        >
          <span>Gestão · Estratégia · Tecnologia</span>
          <span style={{ color: "#d7a83e", letterSpacing: 6, fontSize: 22, fontFamily: font ? "Oswald" : "sans-serif" }}>
            {hero2026.concept.toUpperCase()}
          </span>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Oswald", data: font, weight: 500, style: "normal" }] : [] },
  );
}
