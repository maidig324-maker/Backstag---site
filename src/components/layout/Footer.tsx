import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { contact, site } from "@/content/site";
import { hasWhatsapp, whatsappLink } from "@/lib/contact";
import { visibleNavigation } from "@/lib/visibility";
import { Logo } from "@/components/ui/Logo";
import { NetCorner } from "@/components/ui/NetCorner";

/** Ícone de câmera (rede social de fotos), desenhado aqui para não depender de marca. */
function PhotoIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/**
 * Rodapé completo: marca, menu, contato, redes sociais e políticas.
 * O número do WhatsApp nunca aparece escrito — só o botão.
 * E-mail e outras redes só entram quando configurados em site.ts.
 */
export function Footer() {
  const wa = whatsappLink();
  const year = new Date().getFullYear();
  const link = "inline-flex min-h-11 items-center gap-2 text-sm text-paper/80 transition-colors hover:text-paper";
  const head = "label-tech mb-2 text-paper";

  return (
    <footer className="relative overflow-clip pb-8 pt-20 md:pt-28">
      <NetCorner corner="tr" className="top-6 opacity-60" />
      <div className="container-x relative">
        {/* marca e chamada */}
        <div className="flex flex-col items-center gap-7 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <Logo size="lg" />
            <p className="display mt-5 text-2xl text-paper md:text-3xl">
              Gestão. Estratégia. <span className="accent">Tecnologia.</span>
            </p>
          </div>
          {hasWhatsapp && wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-3 rounded-full bg-coal pl-6 pr-1.5 text-[0.95rem] font-medium text-white transition-transform duration-500 active:scale-[0.98]"
            >
              Conversar pelo WhatsApp
              <span aria-hidden className="inline-flex size-9 items-center justify-center rounded-full bg-sun text-coal">
                <MessageCircle className="size-4" strokeWidth={1.5} />
              </span>
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          )}
        </div>

        {/* colunas: menu, contato, redes sociais, políticas */}
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-16 md:grid-cols-4">
          <nav aria-label="Menu do rodapé" className="min-w-0">
            <p className={head}>Menu</p>
            <ul>
              <li>
                <a href="/#topo" className={link}>
                  Início
                </a>
              </li>
              {visibleNavigation.map((item) => (
                <li key={item.href}>
                  <a href={`/${item.href}`} className={link}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <p className={head}>Contato</p>
            <ul>
              {hasWhatsapp && wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className={link}>
                    <MessageCircle className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    WhatsApp
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className={`${link} break-all`}>
                    <Mail className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    {contact.email}
                  </a>
                </li>
              )}
              <li>
                <a href="/#contato" className={link}>
                  <ArrowUpRight className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                  Solicitar diagnóstico
                </a>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <p className={head}>Redes sociais</p>
            <ul>
              <li>
                <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className={link}>
                  <PhotoIcon />
                  <span className="flex flex-col leading-tight">
                    Instagram
                    <span className="text-xs text-mute">{contact.instagramHandle}</span>
                  </span>
                </a>
              </li>
              {contact.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className={link}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <p className={head}>Políticas</p>
            <ul>
              <li>
                <Link href="/privacidade" className={link}>
                  Política de privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-2 text-center text-xs text-mute md:flex-row md:justify-between md:text-left">
          <p>
            © {year} {site.name} — {site.positioning}. Todos os direitos reservados.
          </p>
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
