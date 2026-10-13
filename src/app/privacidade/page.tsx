import Link from "next/link";
import type { Metadata } from "next";
import { contact, site } from "@/content/site";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Como a ${site.name} trata as informações enviadas pelo site.`,
  alternates: { canonical: "/privacidade" },
};

/**
 * ⚠️ Texto-base. Revise com assessoria jurídica antes de publicar e
 * complemente com os dados do controlador (razão social, CNPJ e e-mail
 * de contato) quando disponíveis. Não preencha com dados fictícios.
 */
export default function PrivacyPage() {
  return (
    <main className="container-x max-w-3xl py-16 md:py-24">
      <Link href="/" className="-m-2 inline-flex p-2" aria-label="Voltar para o início">
        <Logo />
      </Link>
      <h1 className="display mt-16 text-5xl md:text-6xl">Política de privacidade</h1>

      <div className="mt-12 space-y-8 leading-relaxed text-paper/85 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:text-paper">
        <section>
          <h2>Quais dados recebemos</h2>
          <p className="mt-3">
            Pelo formulário de contato, você pode informar nome, empresa, número de WhatsApp, serviço de interesse
            e a descrição do seu desafio.
          </p>
        </section>
        <section>
          <h2>Como o envio funciona</h2>
          <p className="mt-3">
            Este site não armazena os dados do formulário. Ao enviar, uma mensagem é montada no seu próprio
            navegador e aberta no WhatsApp ou no Direct do Instagram da {site.name}. O envio só acontece quando você
            confirma a mensagem nesses aplicativos, que possuem suas próprias políticas de privacidade.
          </p>
        </section>
        <section>
          <h2>Para que usamos</h2>
          <p className="mt-3">
            As informações são usadas exclusivamente para responder à sua solicitação e conversar sobre os serviços
            de interesse. Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais.
          </p>
        </section>
        <section>
          <h2>Seus direitos</h2>
          <p className="mt-3">
            Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode solicitar acesso, correção
            ou exclusão dos seus dados a qualquer momento pelos nossos canais de atendimento, como o Instagram{" "}
            <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gold-light underline underline-offset-4">
              {contact.instagramHandle}
            </a>
            .
          </p>
        </section>
      </div>

      <Link href="/" className="mt-16 inline-flex min-h-12 items-center text-sm text-gold-light underline underline-offset-4">
        Voltar para o site
      </Link>
    </main>
  );
}
