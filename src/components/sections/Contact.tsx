import { contact, contactSection } from "@/content/site";
import { hasWhatsapp, primaryContact } from "@/lib/contact";
import { MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { LineReveal, Reveal } from "@/components/ui/motion";
import { LeadForm } from "./LeadForm";

export function Contact() {
  const main = primaryContact();

  return (
    <section id="contato" aria-label={contactSection.label} className="relative isolate overflow-hidden py-28 md:py-44">
      <div className="container-x">

        <LineReveal
          as="h2"
          lines={contactSection.title
            .split(/(?<=\.)\s+/)
            .map((l, i) => (i === 0 ? l : <span key={i} className="accent">{l}</span>))}
          className="display max-w-6xl text-[clamp(2.7rem,7.2vw,7.5rem)] leading-[0.95]"
        />

        <div className="mt-14 grid gap-16 md:mt-20 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Reveal>
              <p className="max-w-md text-lg leading-relaxed text-paper/80">{contactSection.text}</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10 flex flex-col items-start gap-3">
              <ButtonLink href={main.href} external icon={<MessageCircle className="size-4" strokeWidth={1.75} />}>
                {main.channel === "whatsapp" ? contactSection.whatsappCta : "Conversar pelo Instagram"}
              </ButtonLink>
              <ButtonLink href={contact.instagramUrl} variant="ghost" external>
                {contactSection.instagramCta}
              </ButtonLink>
              {hasWhatsapp && (
                <p className="label-tech mt-3 text-paper/60">
                  WhatsApp comercial <span className="select-all text-paper">{contact.whatsappDisplay}</span>
                </p>
              )}
              {!hasWhatsapp && (
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-mute">
                  O atendimento por WhatsApp será disponibilizado em breve. Enquanto isso, fale com a Backstag
                  pelo Direct do Instagram.
                </p>
              )}
            </Reveal>
          </div>

          <Reveal delay={0.15} className="md:col-span-6 md:col-start-7">
            <div className="tone-dark rounded-xl bg-ink p-6 shadow-[0_40px_90px_-40px_rgb(11_11_12/0.7)] md:p-10">
              <LeadForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
