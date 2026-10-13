import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { NextChapters } from "./NextChapters";

/**
 * Moldura das prévias de direção visual (rota /prototipo).
 * Barra inferior alterna entre as alternativas para comparação.
 */
export function PrototypeShell({ current, children }: { current: "a" | "b"; children: React.ReactNode }) {
  const opts = [
    { id: "a", label: "A — Rede", href: "/prototipo/a" },
    { id: "b", label: "B — Camadas", href: "/prototipo/b" },
  ] as const;
  return (
    <>
      <Header linkPrefix="/" />
      <main id="conteudo">
        {children}
        <NextChapters />
      </main>
      <nav
        aria-label="Alternativas de hero"
        className="fixed right-3 top-[4.5rem] z-[65] flex items-center gap-1 rounded-full border border-line-strong bg-ink/85 p-1 backdrop-blur md:bottom-4 md:left-1/2 md:right-auto md:top-auto md:-translate-x-1/2"
      >
        <span className="label-tech hidden px-3 text-mute sm:inline">Prévia</span>
        {opts.map((o) => (
          <Link
            key={o.id}
            href={o.href}
            aria-current={current === o.id ? "page" : undefined}
            className={`inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-3 text-xs md:px-4 md:text-sm transition-colors ${
              current === o.id ? "bg-gold text-ink" : "text-paper/75 hover:text-paper"
            }`}
          >
            {o.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
