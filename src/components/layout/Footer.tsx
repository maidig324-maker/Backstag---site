import Link from "next/link";
import { contact, site } from "@/content/site";
import { services } from "@/content/services";
import { hasWhatsapp, whatsappLink } from "@/lib/contact";
import { visibleNavigation } from "@/lib/visibility";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const wa = whatsappLink();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink pt-20 md:pt-28">
      <div className="container-x">
        <div className="grid gap-14 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-6 text-sm text-paper/85">{site.fullName}</p>
            <p className="display mt-6 text-3xl text-paper/90 md:text-4xl">
              Gestão. Estratégia. <span className="accent">Tecnologia.</span>
            </p>
          </div>

          <nav aria-label="Serviços" className="md:col-span-3">
            <p className="cue">Serviços</p>
            <ul className="mt-5 space-y-1">
              {services.map((s) => (
                <li key={s.id}>
                  <a href="#solucoes" className="inline-flex min-h-10 items-center text-sm text-mute hover:text-paper">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Rodapé" className="md:col-span-2">
            <p className="cue">Navegação</p>
            <ul className="mt-5 space-y-1">
              {visibleNavigation.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="inline-flex min-h-10 items-center text-sm text-mute hover:text-paper">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className="cue">Contato</p>
            <ul className="mt-5 space-y-1">
              <li>
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center text-sm text-mute hover:text-paper"
                >
                  Instagram {contact.instagramHandle}
                </a>
              </li>
              {hasWhatsapp && wa && (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center text-sm text-mute hover:text-paper"
                  >
                    WhatsApp comercial
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Assinatura em escala — o nome encerra a página */}
        <p aria-hidden className="mt-20 select-none overflow-hidden whitespace-nowrap font-sans text-[clamp(3rem,14.5vw,14rem)] font-semibold leading-[0.8] tracking-[0.04em] text-paper/[0.04] md:mt-28">
          {site.name}
        </p>

        <div className="flex flex-col gap-3 border-t border-line py-8 text-xs text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Todos os direitos reservados.
          </p>
          <Link href="/privacidade" className="inline-flex min-h-10 items-center hover:text-paper">
            Política de privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
