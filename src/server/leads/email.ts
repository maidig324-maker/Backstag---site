import { formatPhoneDisplay } from "@/lib/leads";

export type QueuedLead = {
  protocolo: string;
  criado_em: string;
  nome: string;
  empresa: string;
  whatsapp: string;
  servico: string;
  necessidade: string;
  origem: string;
  referencia: string | null;
  pagina_envio: string | null;
  pagina_entrada: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  ambiente: "homologacao" | "producao";
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const ORIGEM: Record<string, string> = {
  google: "Google",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  youtube: "YouTube",
  email: "E-mail",
  direto: "Acesso direto",
  outro: "Outro site",
};

/**
 * E-mail de aviso de novo lead. O conteúdo é sempre o mesmo para o mesmo
 * lead (sem horário de envio), para que repetições com a mesma chave de
 * idempotência sejam reconhecidas pelo provedor.
 */
export function leadEmail(l: QueuedLead) {
  const quando = new Date(l.criado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
  const tag = l.ambiente === "homologacao" ? "[HOMOLOGAÇÃO] " : "";
  const subject = `${tag}Novo lead ${l.protocolo} — ${l.empresa}`.slice(0, 180);
  const utm = [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(" / ");
  const rows: [string, string][] = [
    ["Protocolo", l.protocolo],
    ["Recebido em", `${quando} (Brasília)`],
    ["Nome", l.nome],
    ["Empresa", l.empresa],
    ["WhatsApp", formatPhoneDisplay(l.whatsapp)],
    ["Serviço de interesse", l.servico],
    ["Origem", ORIGEM[l.origem] ?? l.origem],
    ...(l.referencia ? ([["Site de origem", l.referencia]] as [string, string][]) : []),
    ...(utm ? ([["Campanha", utm]] as [string, string][]) : []),
    ...(l.pagina_entrada ? ([["Página de entrada", l.pagina_entrada]] as [string, string][]) : []),
    ["Status", "Novo lead"],
  ];
  const wa = `https://wa.me/${l.whatsapp}`;

  const text = [
    `${tag}Novo lead pelo formulário de diagnóstico`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Necessidade:",
    l.necessidade,
    "",
    `Responder pelo WhatsApp: ${wa}`,
    "",
    "Aviso automático do site BACKSTAG. Dados pessoais: trate conforme a Política de Privacidade.",
  ].join("\n");

  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f7f7f5;font-family:Arial,Helvetica,sans-serif;color:#141414">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:28px">
<tr><td style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#5b5b5b">${esc(tag)}Novo lead — formulário de diagnóstico</td></tr>
<tr><td style="padding:8px 0 18px;font-size:24px;font-weight:bold">${esc(l.empresa)}</td></tr>
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:6px 0;border-top:1px solid #eeeeea;font-size:14px"><span style="color:#5b5b5b">${esc(k)}</span><br><strong>${esc(v)}</strong></td></tr>`,
  )
  .join("\n")}
<tr><td style="padding:14px 0 6px;border-top:1px solid #eeeeea;font-size:14px;color:#5b5b5b">Necessidade</td></tr>
<tr><td style="font-size:15px;line-height:1.55;white-space:pre-wrap">${esc(l.necessidade)}</td></tr>
<tr><td style="padding-top:22px"><a href="${esc(wa)}" style="display:inline-block;background:#f4c400;color:#141414;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">Responder pelo WhatsApp</a></td></tr>
<tr><td style="padding-top:22px;font-size:12px;color:#7a7a7a">Aviso automático do site BACKSTAG. Dados pessoais: trate conforme a Política de Privacidade.</td></tr>
</table></td></tr></table></body></html>`;

  return { subject, text, html };
}
