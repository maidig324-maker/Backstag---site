import { contact } from "@/content/site";

export const hasWhatsapp = contact.whatsappNumber.length >= 12;

/** Link wa.me com mensagem pré-preenchida. Retorna null se o número não estiver configurado. */
export function whatsappLink(message: string = contact.whatsappGreeting): string | null {
  if (!hasWhatsapp) return null;
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Destino do botão principal de contato.
 * Sem número configurado, usa o Direct do Instagram — um canal real,
 * nunca um link fictício.
 */
export function primaryContact(): { href: string; channel: "whatsapp" | "instagram" } {
  const wa = whatsappLink();
  return wa
    ? { href: wa, channel: "whatsapp" }
    : { href: contact.instagramDirectUrl, channel: "instagram" };
}

export type LeadForm = {
  name: string;
  company: string;
  phone: string;
  service: string;
  challenge: string;
};

/**
 * Mensagem para o WhatsApp a partir do formulário.
 * - Com protocolo: o cadastro já foi confirmado; a mensagem só continua a conversa.
 * - Sem protocolo: o cadastro NÃO foi confirmado; a mensagem leva os dados
 *   preenchidos (para a pessoa não digitar de novo) e diz isso claramente.
 */
export function formatLeadMessage(f: LeadForm, protocolo?: string): string {
  if (protocolo) {
    return [
      "Olá! Acabei de enviar uma solicitação de diagnóstico pelo site da BACKSTAG.",
      "",
      `*Protocolo:* ${protocolo}`,
      `*Nome:* ${f.name.trim()}`,
      `*Empresa:* ${f.company.trim()}`,
      `*Serviço de interesse:* ${f.service}`,
    ].join("\n");
  }
  return [
    "Olá! Tentei enviar uma solicitação de diagnóstico pelo site da BACKSTAG, mas o cadastro não foi concluído. Seguem meus dados:",
    "",
    `*Nome:* ${f.name.trim()}`,
    `*Empresa:* ${f.company.trim()}`,
    `*WhatsApp:* ${f.phone.trim()}`,
    `*Serviço de interesse:* ${f.service}`,
    "",
    "*Desafio:*",
    f.challenge.trim(),
  ].join("\n");
}

/** Validação simples de telefone brasileiro (10 a 13 dígitos). */
export function isValidPhone(v: string): boolean {
  const d = v.replace(/\D/g, "");
  return d.length >= 10 && d.length <= 13;
}

/** Máscara leve: (31) 99999-9999 */
export function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
