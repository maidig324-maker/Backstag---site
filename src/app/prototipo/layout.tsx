import type { Metadata } from "next";

// Prévias internas: fora dos buscadores.
export const metadata: Metadata = {
  title: "Prévia de direção visual",
  robots: { index: false, follow: false },
};

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
