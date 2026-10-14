import Link from "next/link";
import { contact, site } from "@/content/site";
import { hasWhatsapp, whatsappLink } from "@/lib/contact";
import { Logo } from "@/components/ui/Logo";

/** Rodapé enxuto: marca, assinatura e os canais. A navegação já está no topo. */
export function Footer() {
  const wa = whatsappLink();
  const year = new Date().getFullYear();
  const link = "inline-flex min-h-11 items-center text-sm text-mute transition-colors hover:text-paper";

  return (
    <footer className="pb-8 pt-16 md:pt-24">
      <div className="container-x flex flex-col items-center text-center">
        <Logo size="lg" />
        <p className="display mt-6 text-2xl text-paper/90 md:text-3xl">
          Gestão. Estratégia. <span className="accent">Tecnologia.</span>
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-1">
          {hasWhatsapp && wa && (
            <li>
              <a href={wa} target="_blank" rel="noopener noreferrer" className={link}>
                WhatsApp
              </a>
            </li>
          )}
          <li>
            <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className={link}>
              Instagram {contact.instagramHandle}
            </a>
          </li>
          <li>
            <Link href="/privacidade" className={link}>
              Política de privacidade
            </Link>
          </li>
        </ul>

        <p className="mt-10 text-xs text-mute">
          © {year} {site.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
