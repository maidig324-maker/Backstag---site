import { ArrowRight, MessageCircle } from "lucide-react";
import { opening } from "@/content/opening";
import { primaryContact } from "@/lib/contact";
import { ButtonLink } from "@/components/ui/ButtonLink";

/**
 * COMPOSIÇÃO FINAL — mensagem e botões
 * Entra quando as cinco camadas terminam de se encaixar (--fn).
 * Enquanto invisível, fica inerte: não recebe foco nem toque.
 */
export function FinalMessage({ ready, as = "p" }: { ready: boolean; as?: "p" | "h2" }) {
  const Tag = as;
  return (
    <div className="hx-final col-start-1 row-start-1 self-end" aria-hidden={!ready}>
      <Tag className="display hx-title">
        {opening.closing[0]} <span className="accent">{opening.closing[1]}</span>
      </Tag>
      <p className="mt-5 text-sm text-paper/75 md:text-base">
        <span className="font-display font-medium uppercase tracking-[0.08em] text-paper">BACKSTAG</span>
        <span className="mx-2 text-gold">/</span>
        {opening.signature}
      </p>
    </div>
  );
}

export function FinalActions({ ready, compact = false, className = "" }: { ready: boolean; compact?: boolean; className?: string }) {
  const main = primaryContact();
  const contactLabel = main.channel === "whatsapp" ? "Conversar pelo WhatsApp" : "Fale com a Backstag";
  if (compact) {
    // celular: botão principal + contato direto lado a lado, numa só linha
    return (
      <div className={`hx-cta flex items-center gap-3 ${className}`} inert={!ready}>
        <ButtonLink href={opening.cta.href} className="flex-1" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
          {opening.cta.label}
        </ButtonLink>
        <a
          href={main.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={contactLabel}
          className="grid size-12 shrink-0 place-items-center rounded-full border border-line-strong text-paper transition-colors duration-500 hover:border-gold hover:text-gold-light active:scale-[0.97]"
        >
          <MessageCircle className="size-5" strokeWidth={1.5} />
        </a>
      </div>
    );
  }
  return (
    <div className={`hx-cta flex flex-col items-start gap-3 ${className}`} inert={!ready}>
      <ButtonLink href={opening.cta.href} className="whitespace-nowrap" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
        {opening.cta.label}
      </ButtonLink>
      <ButtonLink href={main.href} external variant="ghost" className="whitespace-nowrap" icon={<MessageCircle className="size-4" strokeWidth={1.5} />}>
        {contactLabel}
      </ButtonLink>
    </div>
  );
}
