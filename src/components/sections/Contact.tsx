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
          className="display t-h2 mx-auto max-w-4xl text-center"
        />

        <div className="mt-12 grid gap-14 md:mt-16 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="mx-auto max-w-md text-center text-lg leading-relaxed text-paper/80 lg:mx-0 lg:text-left">{contactSection.text}</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10 flex flex-col items-center gap-3 lg:items-start">
              <ButtonLink href={main.href} external icon={<MessageCircle className="size-4" strokeWidth={1.5} />}>
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

          <Reveal delay={0.15} className="mx-auto w-full max-w-xl lg:col-span-6 lg:col-start-7 lg:max-w-none">
            {/* moldura dupla: aro claro por fora, núcleo escuro com brilho por dentro */}
            <div className="rounded-[2rem] bg-[linear-gradient(160deg,rgb(20_18_14/0.08),rgb(20_18_14/0.03))] p-2 shadow-[0_0_0_1px_rgb(20_18_14/0.08),0_60px_100px_-50px_rgb(20_18_14/0.55)]">
              <div className="tone-dark rounded-[calc(2rem-0.5rem)] bg-ink p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] md:p-10">
                <LeadForm />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
