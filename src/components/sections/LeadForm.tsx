"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { services } from "@/content/services";
import { contact } from "@/content/site";
import {
  formatLeadMessage,
  hasWhatsapp,
  isValidPhone,
  maskPhone,
  whatsappLink,
  type LeadForm as LeadData,
} from "@/lib/contact";

const serviceOptions = [...services.map((s) => s.title), "Ainda não sei — quero um diagnóstico"];

type Errors = Partial<Record<keyof LeadData | "consent", string>>;
type Status =
  | { type: "idle" }
  | { type: "done"; href: string; copied: boolean; message: string };

const empty: LeadData = { name: "", company: "", phone: "", service: "", challenge: "" };

function validate(d: LeadData, consent: boolean): Errors {
  const e: Errors = {};
  if (d.name.trim().length < 2) e.name = "Informe seu nome.";
  if (d.company.trim().length < 2) e.company = "Informe o nome da empresa.";
  if (!isValidPhone(d.phone)) e.phone = "Informe um WhatsApp com DDD.";
  if (!d.service) e.service = "Escolha uma opção.";
  if (d.challenge.trim().length < 10) e.challenge = "Descreva o desafio em pelo menos algumas palavras.";
  if (!consent) e.consent = "É preciso concordar para continuar.";
  return e;
}

/**
 * Formulário sem backend: monta a mensagem e abre o WhatsApp da Backstag.
 * Nada é armazenado pelo site. Sem número configurado, a mensagem é
 * copiada e o Direct do Instagram é aberto — isso é dito ao visitante.
 */
export function LeadForm() {
  const uid = useId();
  const [data, setData] = useState<LeadData>(empty);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const set = (k: keyof LeadData) => (v: string) => {
    setData((d) => ({ ...d, [k]: k === "phone" ? maskPhone(v) : v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const e = validate(data, consent);
    setErrors(e);
    const firstError = Object.keys(e)[0];
    if (firstError) {
      document.getElementById(`${uid}-${firstError}`)?.focus();
      return;
    }

    const message = formatLeadMessage(data);
    const wa = whatsappLink(message);
    const href = wa ?? contact.instagramDirectUrl;
    let copied = false;

    if (!wa) {
      try {
        await navigator.clipboard.writeText(message);
        copied = true;
      } catch {
        copied = false;
      }
    }

    // Se o navegador bloquear a nova aba, a tela seguinte oferece o link manual.
    window.open(href, "_blank", "noopener,noreferrer");
    setStatus({ type: "done", href, copied, message });
  }

  const channelNote = hasWhatsapp
    ? "Ao enviar, o WhatsApp da Backstag abrirá com sua mensagem pronta. Você revisa e confirma o envio por lá."
    : "O WhatsApp ainda não está disponível: ao enviar, copiamos sua mensagem e abrimos o Direct do Instagram da Backstag para você colar e enviar.";

  if (status.type === "done") {
    return (
      <div role="status" className="border border-line bg-ink-2/60 p-6 md:p-10">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-gold text-ink">
          <Check className="size-5" strokeWidth={2} aria-hidden />
        </span>
        <p className="display mt-6 text-3xl">Sua mensagem está pronta.</p>
        <p className="mt-4 leading-relaxed text-mute">
          {hasWhatsapp
            ? "Abrimos o WhatsApp em uma nova aba. Basta confirmar o envio por lá."
            : status.copied
              ? "Copiamos a mensagem e abrimos o Direct do Instagram. Cole o texto na conversa e envie."
              : "Abrimos o Direct do Instagram. Copie o texto abaixo, cole na conversa e envie."}
        </p>
        {!hasWhatsapp && !status.copied && (
          <textarea
            readOnly
            value={status.message}
            rows={8}
            aria-label="Mensagem para copiar"
            className="mt-5 w-full resize-none border border-line bg-ink p-3 font-mono text-xs text-paper/85"
            onFocus={(e) => e.currentTarget.select()}
          />
        )}
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <a
            href={status.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-gold-light underline underline-offset-4"
          >
            A conversa não abriu? Abrir novamente
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => {
              setStatus({ type: "idle" });
              setData(empty);
              setConsent(false);
            }}
            className="inline-flex min-h-11 items-center text-mute hover:text-paper"
          >
            Preencher outra mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-describedby={`${uid}-note`} className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
      <Field id={`${uid}-name`} label="Nome" error={errors.name}>
        <input
          id={`${uid}-name`}
          name="name"
          autoComplete="name"
          value={data.name}
          onChange={(e) => set("name")(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${uid}-name-err` : undefined}
          className={inputCls}
        />
      </Field>
      <Field id={`${uid}-company`} label="Empresa" error={errors.company}>
        <input
          id={`${uid}-company`}
          name="company"
          autoComplete="organization"
          value={data.company}
          onChange={(e) => set("company")(e.target.value)}
          aria-invalid={!!errors.company}
          aria-describedby={errors.company ? `${uid}-company-err` : undefined}
          className={inputCls}
        />
      </Field>
      <Field id={`${uid}-phone`} label="WhatsApp" error={errors.phone}>
        <input
          id={`${uid}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(31) 99999-9999"
          value={data.phone}
          onChange={(e) => set("phone")(e.target.value)}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
          className={inputCls}
        />
      </Field>
      <Field id={`${uid}-service`} label="Serviço de interesse" error={errors.service}>
        <select
          id={`${uid}-service`}
          name="service"
          value={data.service}
          onChange={(e) => set("service")(e.target.value)}
          aria-invalid={!!errors.service}
          aria-describedby={errors.service ? `${uid}-service-err` : undefined}
          className={`${inputCls} appearance-none bg-[length:12px] bg-[right_0.25rem_center] bg-no-repeat pr-8`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%23D7A83E' stroke-width='1.5'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E\")",
          }}
        >
          <option value="" disabled className="bg-ink">
            Selecione
          </option>
          {serviceOptions.map((s) => (
            <option key={s} value={s} className="bg-ink">
              {s}
            </option>
          ))}
        </select>
      </Field>
      <Field id={`${uid}-challenge`} label="Descreva o desafio" error={errors.challenge} className="sm:col-span-2">
        <textarea
          id={`${uid}-challenge`}
          name="challenge"
          rows={4}
          value={data.challenge}
          onChange={(e) => set("challenge")(e.target.value)}
          aria-invalid={!!errors.challenge}
          aria-describedby={errors.challenge ? `${uid}-challenge-err` : undefined}
          className={`${inputCls} resize-y`}
          placeholder="O que hoje mais atrapalha a operação ou o crescimento da empresa?"
        />
      </Field>

      <div className="sm:col-span-2">
        <label htmlFor={`${uid}-consent`} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-paper/80">
          <input
            id={`${uid}-consent`}
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (errors.consent) setErrors((x) => ({ ...x, consent: undefined }));
            }}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
            className="mt-0.5 size-5 shrink-0 accent-[#D7A83E]"
          />
          <span>
            Concordo em enviar estes dados à Backstag para ser contatado sobre minha solicitação, conforme a{" "}
            <Link href="/privacidade" className="text-gold-light underline underline-offset-4">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p id={`${uid}-consent-err`} className="mt-2 text-sm text-[#ff9b8a]">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2">
        <p id={`${uid}-note`} className="text-xs leading-relaxed text-mute">
          {channelNote} Nenhum dado é armazenado por este site.
        </p>
        <button
          type="submit"
          className="group inline-flex min-h-12 items-center justify-center gap-3 self-start rounded-full bg-gold px-7 font-medium text-ink transition-colors hover:bg-gold-light"
        >
          {hasWhatsapp ? "Enviar pelo WhatsApp" : "Copiar e abrir o Instagram"}
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full border-0 border-b border-line-strong bg-transparent px-0 py-3 text-base text-paper placeholder:text-paper/30 transition-colors focus:border-gold focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-[#ff9b8a]";

function Field({
  id,
  label,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="cue block text-[0.68rem] text-paper/60">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm text-[#ff9b8a]">
          {error}
        </p>
      )}
    </div>
  );
}
