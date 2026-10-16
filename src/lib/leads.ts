/**
 * Regras do formulário de diagnóstico, compartilhadas entre o navegador
 * e a API (o servidor sempre valida de novo — nunca confia no navegador).
 */
import { services } from "@/content/services";

/** Versão da Política de Privacidade vigente (gravada junto com cada lead). */
export const POLICY_VERSION = "2026-10-v1";

export const SERVICE_OPTIONS: readonly string[] = [...services.map((s) => s.title), "Ainda não sei — quero um diagnóstico"];

export const LIMITS = {
  nome: [2, 120],
  empresa: [2, 160],
  necessidade: [10, 2000],
  links: 2,
} as const;

export type LeadFields = {
  nome: string;
  empresa: string;
  whatsapp: string;
  servico: string;
  necessidade: string;
};

export type LeadFieldErrors = Partial<Record<keyof LeadFields, string>>;

/** Remove caracteres de controle; mantém quebras de linha só onde pedido. */
function clean(v: unknown, multiline = false): string {
  if (typeof v !== "string") return "";
  let s = v.normalize("NFC").replace(/[​-‏‪-‮⁠-⁤﻿]/g, "");
  s = multiline
    ? s.replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "").replace(/\n{3,}/g, "\n\n")
    : s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ");
  return s.trim();
}

const countLinks = (s: string) => (s.match(/(https?:\/\/|www\.)/gi) ?? []).length;

/** Telefone brasileiro → formato internacional só com números (55 + DDD + número). */
export function normalizePhone(v: string): string | null {
  let d = (v ?? "").replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  if (!/^[1-9]{2}/.test(d)) return null;
  if (d.length === 11 && d[2] !== "9") return null; // celular começa com 9
  return "55" + d;
}

/** Valida e normaliza. Usado igualmente no formulário e na API. */
export function validateLead(raw: Partial<Record<keyof LeadFields, unknown>>): {
  ok: boolean;
  data: LeadFields;
  errors: LeadFieldErrors;
} {
  const nome = clean(raw.nome);
  const empresa = clean(raw.empresa);
  const servico = clean(raw.servico);
  const necessidade = clean(raw.necessidade, true);
  const whatsapp = normalizePhone(typeof raw.whatsapp === "string" ? raw.whatsapp : "");
  const errors: LeadFieldErrors = {};

  if (nome.length < LIMITS.nome[0]) errors.nome = "Informe seu nome.";
  else if (nome.length > LIMITS.nome[1]) errors.nome = `Use até ${LIMITS.nome[1]} caracteres.`;
  else if (countLinks(nome) > 0) errors.nome = "Informe apenas o seu nome.";

  if (empresa.length < LIMITS.empresa[0]) errors.empresa = "Informe o nome da empresa.";
  else if (empresa.length > LIMITS.empresa[1]) errors.empresa = `Use até ${LIMITS.empresa[1]} caracteres.`;

  if (!whatsapp) errors.whatsapp = "Informe um WhatsApp com DDD.";

  if (!SERVICE_OPTIONS.includes(servico)) errors.servico = "Escolha uma opção.";

  if (necessidade.length < LIMITS.necessidade[0]) errors.necessidade = "Descreva o desafio em pelo menos algumas palavras.";
  else if (necessidade.length > LIMITS.necessidade[1]) errors.necessidade = `Use até ${LIMITS.necessidade[1]} caracteres.`;
  else if (countLinks(necessidade) > LIMITS.links) errors.necessidade = "Use no máximo 2 links na descrição.";

  return { ok: Object.keys(errors).length === 0, data: { nome, empresa, whatsapp: whatsapp ?? "", servico, necessidade }, errors };
}

/** (21) 98765-4321 a partir de 5521987654321. */
export function formatPhoneDisplay(intl: string): string {
  const d = intl.startsWith("55") ? intl.slice(2) : intl;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return intl;
}

export const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Dados de origem do visitante (sem cookies; guardados só na sessão do navegador). */
export type LeadContext = {
  pagina_envio?: string;
  pagina_entrada?: string;
  referencia?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** Corpo enviado para POST /api/leads. */
export type LeadRequestBody = {
  envio_id: string;
  turnstile_token?: string;
  ciencia_politica: boolean;
  lead: Record<keyof LeadFields, string>;
  contexto?: LeadContext;
  /** Campo-armadilha (deve vir vazio) e tempo de preenchimento. */
  armadilha?: { site?: string; tempo_ms?: number };
};

export type LeadApiResponse =
  | { ok: true; protocolo: string; repetido?: boolean }
  | {
      ok: false;
      erro: "invalido" | "verificacao" | "limitado" | "conflito" | "indisponivel" | "origem";
      campos?: LeadFieldErrors;
      tentar_apos_segundos?: number;
      /** true quando o servidor não sabe se a gravação aconteceu (ex.: tempo esgotado). */
      incerto?: boolean;
    };
