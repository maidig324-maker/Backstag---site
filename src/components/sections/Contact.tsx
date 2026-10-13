import { contact, contactSection } from "@/content/site";
import { hasWhatsapp, primaryContact } from "@/lib/contact";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { LineReveal, Reveal } from "@/components/ui/motion";
import { LeadForm } from "./LeadForm";
import { sectionNumber } from "@/lib/visibility";

export function Contact() {
  const main = primaryContact();

  return (
    <section id="contato" aria-label={contactSection.label} className="relative isolate overflow-hidden py-28 md:py-44">
      {/* Fechamento: a luz de palco volta, agora em cima do visitante */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[90%]"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 30% 100%, rgb(215 168 62 / 0.10), transparent 70%)",
        }}
      />
      <div className="container-x">
        <Reveal>
          <p className="cue flex items-center gap-3">
            <span>{sectionNumber("contato")}</span>
            <span aria-hidden className="h-px w-8 bg-gold/60" />
            <span>{contactSection.label}</span>
          </p>
        </Reveal>

        <LineReveal
          as="h2"
          lines={contactSection.title
            .split(/(?<=\.)\s+/)
            .map((l, i) => (i === 0 ? l : <span key={i} className="accent">{l}</span>))}
          className="display mt-8 max-w-6xl text-[clamp(2.7rem,7.2vw,7.5rem)] leading-[0.95]"
        />

        <div className="mt-14 grid gap-16 md:mt-20 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Reveal>
              <p className="max-w-md text-lg leading-relaxed text-paper/80">{contactSection.text}</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10 flex flex-col items-start gap-3">
              <ButtonLink href={main.href} external>
                {main.channel === "whatsapp" ? contactSection.whatsappCta : "Conversar pelo Instagram"}
              </ButtonLink>
              <ButtonLink href={contact.instagramUrl} variant="ghost" external>
                {contactSection.instagramCta}
              </ButtonLink>
              {!hasWhatsapp && (
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-mute">
                  O atendimento por WhatsApp será disponibilizado em breve. Enquanto isso, fale com a Backstag
                  pelo Direct do Instagram.
                </p>
              )}
            </Reveal>
          </div>

          <Reveal delay={0.15} className="md:col-span-6 md:col-start-7">
            <LeadForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
