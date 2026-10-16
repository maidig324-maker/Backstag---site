"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, MessageCircle, RotateCcw } from "lucide-react";
import { formatLeadMessage, hasWhatsapp, maskPhone, whatsappLink, type LeadForm as LeadData } from "@/lib/contact";
import { SERVICE_OPTIONS, validateLead, type LeadApiResponse, type LeadFieldErrors, type LeadRequestBody } from "@/lib/leads";
import { contact } from "@/content/site";
import { readOrigin } from "@/components/layout/OriginCapture";
import { useTurnstile } from "./useTurnstile";

type Errors = Partial<Record<keyof LeadData | "consent", string>>;
type Status =
  | { type: "idle" }
  | { type: "sending" }
  | { type: "done"; protocolo: string }
  | { type: "failed"; reason: "indisponivel" | "verificacao" }
  | { type: "limited"; minutes: number };

const empty: LeadData = { name: "", company: "", phone: "", service: "", challenge: "" };
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** campos da API → campos do formulário */
const FIELD: Record<keyof LeadFieldErrors, keyof LeadData> = {
  nome: "name",
  empresa: "company",
  whatsapp: "phone",
  servico: "service",
  necessidade: "challenge",
};

function toErrors(e: LeadFieldErrors): Errors {
  const out: Errors = {};
  for (const [k, v] of Object.entries(e)) if (v) out[FIELD[k as keyof LeadFieldErrors]] = v;
  return out;
}

const toFields = (d: LeadData) => ({ nome: d.name, empresa: d.company, whatsapp: d.phone, servico: d.service, necessidade: d.challenge });

/** Novo identificador de envio (UUID v4). Reutilizado em novas tentativas do mesmo conteúdo. */
function newEnvioId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Formulário de diagnóstico.
 * 1. Valida no navegador. 2. Envia para a API segura, que grava no banco.
 * 3. Só depois da confirmação mostra o protocolo e o botão do WhatsApp.
 * Se a gravação falhar, diz isso claramente e oferece: tentar de novo
 * (mesmo envio, sem duplicar) ou falar pelo WhatsApp com os dados prontos.
 */
export function LeadForm() {
  const uid = useId();
  const [data, setData] = useState<LeadData>(empty);
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const startedAt = useRef(0);
  const envio = useRef<{ id: string; snapshot: string } | null>(null);
  const resultHeading = useRef<HTMLParagraphElement>(null);
  const { box, take } = useTurnstile(SITE_KEY);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status.type === "done" || status.type === "failed") resultHeading.current?.focus();
  }, [status.type]);

  const set = (k: keyof LeadData) => (v: string) => {
    setData((d) => ({ ...d, [k]: k === "phone" ? maskPhone(v) : v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    if (status.type === "limited") setStatus({ type: "idle" });
  };

  /** Mesmo conteúdo → mesmo envio_id (o servidor não duplica). Conteúdo novo → novo envio_id. */
  function envioFor(d: LeadData): string {
    const snapshot = JSON.stringify(toFields(d));
    if (!envio.current || envio.current.snapshot !== snapshot) envio.current = { id: newEnvioId(), snapshot };
    return envio.current.id;
  }

  async function send(d: LeadData): Promise<LeadApiResponse> {
    const body: LeadRequestBody = {
      envio_id: envioFor(d),
      turnstile_token: (await take()) ?? undefined,
      ciencia_politica: true,
      lead: toFields(d),
      contexto: { ...readOrigin(), pagina_envio: window.location.pathname.slice(0, 300) },
      armadilha: { site: trap, tempo_ms: Date.now() - startedAt.current },
    };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
        cache: "no-store",
      });
      const j = (await res.json().catch(() => null)) as LeadApiResponse | null;
      if (j && typeof j === "object" && "ok" in j) return j;
      return { ok: false, erro: "indisponivel", incerto: res.status >= 500 };
    } catch {
      // sem resposta: não sabemos se gravou
      return { ok: false, erro: "indisponivel", incerto: true };
    } finally {
      clearTimeout(timer);
    }
  }

  async function submit(d: LeadData) {
    setStatus({ type: "sending" });
    let r = await send(d);
    // resultado desconhecido ou conflito: uma nova tentativa automática
    if (!r.ok && r.erro === "indisponivel" && r.incerto) {
      await new Promise((ok) => setTimeout(ok, 1500));
      r = await send(d); // mesmo envio_id: consulta/repete sem duplicar
    } else if (!r.ok && r.erro === "conflito") {
      envio.current = null;
      r = await send(d);
    }

    if (r.ok) return setStatus({ type: "done", protocolo: r.protocolo });
    if (r.erro === "invalido" && r.campos) {
      const e = toErrors(r.campos);
      setErrors(e);
      setStatus({ type: "idle" });
      const first = Object.keys(e)[0];
      if (first) document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    if (r.erro === "limitado") return setStatus({ type: "limited", minutes: Math.ceil((r.tentar_apos_segundos ?? 600) / 60) });
    setStatus({ type: "failed", reason: r.erro === "verificacao" ? "verificacao" : "indisponivel" });
  }

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (status.type === "sending") return; // cliques repetidos
    const v = validateLead(toFields(data));
    const e: Errors = toErrors(v.errors);
    if (!consent) e.consent = "Confirme que leu a Política de Privacidade.";
    setErrors(e);
    const firstError = Object.keys(e)[0];
    if (firstError) {
      document.getElementById(`${uid}-${firstError}`)?.focus();
      return;
    }
    void submit(data);
  }

  function reset() {
    setStatus({ type: "idle" });
    setData(empty);
    setConsent(false);
    envio.current = null;
    startedAt.current = Date.now();
  }

  if (status.type === "done") {
    const wa = whatsappLink(formatLeadMessage(data, status.protocolo));
    return (
      <div role="status" className="border border-line bg-ink-2/60 p-5 sm:p-6 md:p-10">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-gold text-ink">
          <Check className="size-5" strokeWidth={2} aria-hidden />
        </span>
        <p ref={resultHeading} tabIndex={-1} className="display mt-6 text-3xl focus:outline-none">
          Recebemos sua solicitação.
        </p>
        <p className="label-tech mt-4 text-paper">
          Protocolo <span className="font-semibold">{status.protocolo}</span>
        </p>
        <p className="mt-4 leading-relaxed text-mute">
          Seu cadastro foi registrado com segurança. A equipe BACKSTAG vai entrar em contato pelo WhatsApp informado. Se preferir,
          continue a conversa agora.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          {hasWhatsapp && wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 items-center gap-3 whitespace-nowrap rounded-full bg-gold py-1.5 pl-5 pr-1.5 text-[0.9rem] font-medium text-ink sm:pl-6 sm:text-[0.95rem] transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light active:scale-[0.98]"
            >
              Continuar no WhatsApp
              <span aria-hidden className="inline-flex size-9 items-center justify-center rounded-full bg-ink/10">
                <MessageCircle className="size-4" strokeWidth={1.5} />
              </span>
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          )}
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center text-mute hover:text-paper">
            Enviar outra solicitação
          </button>
        </div>
      </div>
    );
  }

  if (status.type === "failed") {
    const wa = whatsappLink(formatLeadMessage(data));
    return (
      <div role="alert" className="border border-line bg-ink-2/60 p-5 sm:p-6 md:p-10">
        <p ref={resultHeading} tabIndex={-1} className="display text-3xl focus:outline-none">
          Não conseguimos confirmar seu cadastro.
        </p>
        <p className="mt-4 leading-relaxed text-mute">
          {status.reason === "verificacao"
            ? "Não foi possível concluir a verificação de segurança do envio. "
            : "Nosso sistema não respondeu a tempo. "}
          <strong className="font-medium text-paper">Sua solicitação não foi registrada.</strong> Você pode tentar novamente ou falar agora
          pelo WhatsApp — a mensagem já vai com os dados que você preencheu.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => void submit(data)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 text-[0.95rem] font-medium text-ink transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light active:scale-[0.98]"
          >
            <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden />
            Tentar novamente
          </button>
          <a
            href={wa ?? contact.instagramDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong px-6 text-[0.95rem] text-paper transition-colors hover:border-gold"
          >
            <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden />
            {wa ? "Falar pelo WhatsApp" : "Falar pelo Instagram"}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
          <button type="button" onClick={() => setStatus({ type: "idle" })} className="inline-flex min-h-11 items-center px-2 text-mute hover:text-paper">
            Revisar os dados
          </button>
        </div>
      </div>
    );
  }

  const sending = status.type === "sending";
  const limitedWa = status.type === "limited" ? whatsappLink(formatLeadMessage(data)) : null;

  return (
    <form noValidate onSubmit={onSubmit} aria-describedby={`${uid}-note`} aria-busy={sending} className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
      <Field id={`${uid}-name`} label="Nome" error={errors.name}>
        <input
          id={`${uid}-name`}
          name="name"
          autoComplete="name"
          required
          aria-required="true"
          maxLength={120}
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
          required
          aria-required="true"
          maxLength={160}
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
          required
          aria-required="true"
          placeholder="(21) 99999-9999"
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
          required
          aria-required="true"
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
          {SERVICE_OPTIONS.map((s) => (
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
          required
          aria-required="true"
          maxLength={2000}
          value={data.challenge}
          onChange={(e) => set("challenge")(e.target.value)}
          aria-invalid={!!errors.challenge}
          aria-describedby={errors.challenge ? `${uid}-challenge-err` : undefined}
          className={`${inputCls} resize-y`}
          placeholder="O que hoje mais atrapalha a operação ou o crescimento da empresa?"
        />
      </Field>

      {/* campo-armadilha: invisível para pessoas, preenchido por robôs */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-site`}>Site</label>
        <input id={`${uid}-site`} name="site" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${uid}-consent`} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-paper/80">
          <input
            id={`${uid}-consent`}
            type="checkbox"
            required
            aria-required="true"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (errors.consent) setErrors((x) => ({ ...x, consent: undefined }));
            }}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
            className="mt-0.5 size-5 shrink-0 accent-[#141414]"
          />
          <span>
            Li e estou ciente da{" "}
            <Link href="/privacidade" className="text-gold-light underline underline-offset-4">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p id={`${uid}-consent-err`} className="mt-2 text-sm text-[#b3261e]">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2">
        <p id={`${uid}-note`} className="text-xs leading-relaxed text-mute">
          Seus dados são usados apenas para responder a esta solicitação. Ao enviar, você recebe um protocolo e pode continuar a conversa
          pelo WhatsApp.
        </p>
        {/* verificação anti-robô (aparece só se for necessário confirmar) */}
        <div ref={box} />
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex min-h-12 items-center justify-center gap-3 self-start rounded-full bg-gold py-1.5 pl-7 pr-1.5 font-medium text-ink transition-[background-color,transform,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          {sending ? "Enviando…" : "Enviar solicitação"}
          <span aria-hidden className="inline-flex size-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105">
            <ArrowUpRight className={`size-4 ${sending ? "animate-pulse" : ""}`} strokeWidth={1.5} />
          </span>
        </button>
        <p aria-live="polite" className="text-sm leading-relaxed text-paper/85">
          {sending && <span className="sr-only">Enviando sua solicitação.</span>}
          {status.type === "limited" && (
            <>
              Recebemos muitas tentativas em pouco tempo. Tente novamente em cerca de {status.minutes} minuto{status.minutes > 1 ? "s" : ""}. Sua
              solicitação ainda não foi registrada.{" "}
              {limitedWa && (
                <a href={limitedWa} target="_blank" rel="noopener noreferrer" className="text-gold-light underline underline-offset-4">
                  Falar pelo WhatsApp
                </a>
              )}
            </>
          )}
        </p>
      </div>
    </form>
  );
}

const inputCls =
  "w-full border-0 border-b border-line-strong bg-transparent px-0 py-3 text-base text-paper placeholder:text-paper/55 transition-colors focus:border-gold focus:shadow-[0_2px_0_0_var(--color-gold-light)] focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-[#b3261e]";

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
    <div className={`group ${className ?? ""}`}>
      <label htmlFor={id} className="cue block text-[0.68rem] text-paper/75 transition-colors group-focus-within:text-gold-light">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}
