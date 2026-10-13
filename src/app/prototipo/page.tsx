import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

/** Página de escolha das prévias — pensada para abrir no celular. */
const options = [
  {
    href: "/prototipo/a",
    code: "A",
    title: "Rede",
    text: "Pontos que se organizam numa estrutura conectada. Toque na tela e role a página.",
  },
  {
    href: "/prototipo/b",
    code: "B",
    title: "Camadas",
    text: "Quatro planos em 3D, um por pilar. Toque nos pilares e role para afastar as camadas.",
  },
] as const;

export default function PrototypeIndex() {
  return (
    <main className="container-x flex min-h-[100svh] flex-col justify-center gap-12 py-16">
      <Logo />
      <div>
        <p className="label-tech text-gold">Prévia de direção visual · uso interno</p>
        <h1 className="display-tech mt-5 text-[clamp(2.6rem,9vw,5.5rem)]">Escolha o hero.</h1>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {options.map((o) => (
          <li key={o.href}>
            <Link
              href={o.href}
              className="group flex min-h-40 flex-col justify-between gap-6 border border-line-strong p-6 transition-colors hover:border-gold"
            >
              <span className="flex items-start justify-between">
                <span className="display-tech text-6xl text-gold-light">{o.code}</span>
                <ArrowUpRight className="size-5 text-paper/60 transition-colors group-hover:text-gold" aria-hidden />
              </span>
              <span>
                <span className="block text-xl text-paper">{o.title}</span>
                <span className="mt-2 block text-sm leading-relaxed text-mute">{o.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
