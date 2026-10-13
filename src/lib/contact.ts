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

export function formatLeadMessage(f: LeadForm): string {
  return [
    "Olá! Conheci a Backstag pelo site e gostaria de conversar sobre soluções para minha empresa.",
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
