import Link from "next/link";
import type { Metadata } from "next";
import { contact, legal, site } from "@/content/site";
import { POLICY_VERSION } from "@/lib/leads";
import { whatsappLink } from "@/lib/contact";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Como a ${site.name} trata os dados pessoais enviados pelo site.`,
  alternates: { canonical: "/privacidade" },
};

/**
 * Política de privacidade alinhada à operação real do formulário
 * (Supabase, Vercel, Cloudflare Turnstile, Resend e caixa de e-mail interna).
 * ⚠️ Revisão jurídica obrigatória antes da publicação comercial. Dados do
 * controlador vêm de `legal` em site.ts; campos vazios não aparecem.
 */
export default function PrivacyPage() {
  const inReview = process.env.VERCEL_ENV !== "production";
  const wa = whatsappLink("Olá! Gostaria de fazer uma solicitação sobre meus dados pessoais (LGPD).");
  const a = "text-gold-light underline underline-offset-4";

  return (
    <main className="container-x max-w-3xl py-16 md:py-24">
      <Link href="/" className="-m-2 inline-flex p-2" aria-label="Voltar para o início">
        <Logo />
      </Link>
      <h1 className="display mt-16 text-5xl md:text-6xl">Política de privacidade</h1>
      <p className="mt-6 text-sm text-mute">
        Versão {POLICY_VERSION} · atualizada em {legal.politicaAtualizadaEm}
      </p>
      {inReview && (
        <p role="note" className="mt-6 rounded-2xl border border-line-strong p-4 text-sm text-paper/85">
          Ambiente de homologação: texto em revisão jurídica e aguardando os dados cadastrais da empresa.
        </p>
      )}

      <div className="mt-12 space-y-10 leading-relaxed text-paper/85 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-paper [&_li]:mt-2 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        <section>
          <h2>Quem é o responsável pelos seus dados</h2>
          <p className="mt-3">
            O controlador dos dados é a {site.fullName}
            {legal.razaoSocial ? `, razão social ${legal.razaoSocial}` : ""}
            {legal.cnpj ? `, CNPJ ${legal.cnpj}` : ""}
            {legal.endereco ? `, com sede em ${legal.endereco}` : ""}. Os canais para falar sobre seus dados estão na seção
            “Seus direitos”.
          </p>
        </section>

        <section>
          <h2>Quais dados coletamos</h2>
          <ul>
            <li>
              <strong className="font-medium text-paper">Dados que você informa no formulário:</strong> nome, empresa, número de WhatsApp,
              serviço de interesse e a descrição da sua necessidade.
            </li>
            <li>
              <strong className="font-medium text-paper">Origem do contato:</strong> a primeira página que você visitou, a página do envio, o
              site de onde você veio (apenas o domínio, como “instagram.com”) e parâmetros de campanha presentes no link (utm). Essas
              informações ficam guardadas só na sessão do seu navegador até o envio; não usamos cookies de rastreamento nem de publicidade.
            </li>
            <li>
              <strong className="font-medium text-paper">Dados técnicos de segurança:</strong> o endereço IP e o número de WhatsApp são
              convertidos em códigos irreversíveis para limitar envios abusivos, guardados por até 2 dias. A verificação anti-robô do
              Cloudflare Turnstile analisa sinais técnicos do navegador no momento do envio.
            </li>
            <li>
              <strong className="font-medium text-paper">Registro de ciência:</strong> a data e a versão desta política no momento do envio.
            </li>
          </ul>
        </section>

        <section>
          <h2>Para que usamos e com qual base legal</h2>
          <ul>
            <li>
              <strong className="font-medium text-paper">Responder à sua solicitação de diagnóstico</strong> e conversar sobre uma possível
              contratação: procedimentos preliminares relacionados a contrato, a seu pedido (art. 7º, V, da LGPD). Quando você entra em
              contato em nome de outra empresa, o tratamento dos seus dados de contato se baseia no legítimo interesse da {site.name} em
              responder a contatos comerciais (art. 7º, IX), limitado ao necessário.
            </li>
            <li>
              <strong className="font-medium text-paper">Segurança e prevenção de abusos</strong> (verificação anti-robô e limite de envios):
              legítimo interesse e dever de segurança (art. 7º, IX, e art. 46).
            </li>
            <li>
              <strong className="font-medium text-paper">Entender quais canais trazem contatos</strong>, de forma agregada: legítimo
              interesse (art. 7º, IX).
            </li>
          </ul>
          <p className="mt-4">
            A caixa “Li e estou ciente da Política de Privacidade” registra que você teve acesso a este texto; ela não é um pedido de
            consentimento. <strong className="font-medium text-paper">Não usamos seus dados para marketing</strong> e não inscrevemos ninguém
            em listas ou campanhas. Se um dia oferecermos esse tipo de comunicação, ela dependerá de um consentimento próprio, separado e
            opcional.
          </p>
        </section>

        <section>
          <h2>Com quem os dados são compartilhados</h2>
          <p className="mt-3">Usamos fornecedores que tratam os dados apenas para prestar o serviço contratado:</p>
          <ul>
            <li>
              <strong className="font-medium text-paper">Supabase</strong> — banco de dados onde a solicitação é registrada (servidores na
              região de São Paulo).
            </li>
            <li>
              <strong className="font-medium text-paper">Vercel</strong> — hospedagem do site e processamento do envio do formulário.
            </li>
            <li>
              <strong className="font-medium text-paper">Cloudflare</strong> — verificação anti-robô (Turnstile).
            </li>
            <li>
              <strong className="font-medium text-paper">Resend</strong> — envio do aviso interno de nova solicitação para a equipe, por
              e-mail, com os dados do formulário. O provedor mantém o histórico de envio por até 30 dias.
            </li>
            <li>
              <strong className="font-medium text-paper">Google (Gmail)</strong> — caixa de e-mail interna que recebe esses avisos.
            </li>
            <li>
              <strong className="font-medium text-paper">WhatsApp (Meta)</strong> — somente se você escolher continuar a conversa por lá; nesse
              caso, vale também a política de privacidade do WhatsApp.
            </li>
          </ul>
          <p className="mt-4">
            Alguns desses fornecedores podem tratar dados fora do Brasil. Essas transferências seguem os mecanismos previstos no art. 33 da
            LGPD. Não vendemos dados pessoais.
          </p>
        </section>

        <section>
          <h2>Por quanto tempo guardamos</h2>
          <ul>
            <li>
              Solicitações que não resultam em contratação são excluídas automaticamente 12 meses após a última interação. Os avisos
              recebidos na caixa de e-mail interna seguem o mesmo prazo.
            </li>
            <li>Se a conversa resultar em contratação, os dados passam a seguir o contrato e os prazos exigidos por lei.</li>
            <li>Códigos de segurança (anti-abuso): até 2 dias.</li>
            <li>Cópias de segurança do banco de dados, quando existentes, são substituídas em até 7 dias.</li>
          </ul>
        </section>

        <section>
          <h2>Seus direitos</h2>
          <p className="mt-3">
            Pela LGPD (art. 18), você pode pedir a confirmação de que tratamos seus dados, acesso, correção, anonimização, bloqueio ou
            eliminação, portabilidade, informação sobre com quem compartilhamos e a revisão de decisões. Também pode se opor ao tratamento
            baseado em legítimo interesse. Respondemos em até 15 dias. Você também pode apresentar reclamação à Autoridade Nacional de
            Proteção de Dados (ANPD).
          </p>
          <p className="mt-4">Para exercer seus direitos, fale conosco por:</p>
          <ul>
            {legal.emailPrivacidade && (
              <li>
                E-mail:{" "}
                <a href={`mailto:${legal.emailPrivacidade}`} className={a}>
                  {legal.emailPrivacidade}
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className={a}>
                  WhatsApp da {site.name}
                </a>
              </li>
            )}
            <li>
              Instagram{" "}
              <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className={a}>
                {contact.instagramHandle}
              </a>
            </li>
          </ul>
          <p className="mt-4">Para sua segurança, poderemos pedir informações que confirmem que o pedido é seu.</p>
        </section>

        <section>
          <h2>Como protegemos</h2>
          <p className="mt-3">
            Os dados ficam em um banco de dados sem acesso público, com acesso restrito à equipe responsável. As conexões são
            criptografadas, os registros técnicos do sistema não contêm dados pessoais e as chaves de acesso ficam apenas no servidor.
          </p>
        </section>

        <section>
          <h2>Alterações</h2>
          <p className="mt-3">
            Esta política pode ser atualizada para refletir mudanças no site ou na lei. A versão vigente e a data de atualização ficam no
            topo desta página.
          </p>
        </section>
      </div>

      <Link href="/" className="mt-16 inline-flex min-h-12 items-center text-sm text-gold-light underline underline-offset-4">
        Voltar para o site
      </Link>
    </main>
  );
}
