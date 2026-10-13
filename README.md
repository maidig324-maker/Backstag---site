# BACKSTAG — Website institucional

Site da **BACKSTAG | Gestão e Soluções Digitais**, construído com Next.js (App Router), React, TypeScript, Tailwind CSS v4, Motion e Lucide.

---

## 1. Proposta visual — conceito "Bastidores"

**Narrativa.** *Backstag* vem de *backstage*. O marketing e a vitrine são o palco, mas o que faz uma empresa funcionar está nos bastidores: processos, operação e tecnologia. A headline já traz essa oposição ("não precisa apenas *aparecer* — precisa *funcionar*"), e o site é construído em cima dela. Conforme rola a página, o visitante entra nos bastidores:

| # | Seção | Papel na narrativa |
|---|-------|--------------------|
| — | Hero | O palco. Uma luz discreta acende sobre a promessa. |
| 01 | O problema | O que trava o negócio fica fora da vista do cliente. |
| 02 | O que fazemos | As quatro frentes, apresentadas como índice editorial, não como cards. |
| 03 | Projetos | Evidência, com honestidade sobre o que já pode ser publicado. |
| 04 | Metodologia | Linha do tempo que se preenche em dourado conforme o scroll. |
| 05 | Resultados | Aparece somente com material real. |
| 06 | Fundador | Quem está nos bastidores. |
| 07 | Conversão | A luz volta, agora sobre o visitante. |

**Tipografia.** *Instrument Serif* nos títulos, com palavras-chave em itálico dourado. *Geist* no corpo e *Geist Mono* em rótulos e numeração, como marcações de palco. Todas as fontes são carregadas pelo `next/font` e servidas pelo próprio site, sem requisições externas no navegador.

**Cor.** Fundo preto `#09090B`, alternando com `#191919` entre as seções para marcar ritmo. O dourado aparece só em fios de 1px, numerais, palavras-chave, botões principais e na barra de progresso. Não há brilhos nem gradientes decorativos. A única luz da página é o "spot" do hero, que volta no fechamento.

**Movimento.** Títulos sobem linha a linha, imagens são reveladas de baixo para cima e o hero recua em profundidade ao rolar. A linha do tempo da metodologia acompanha o scroll. Não há *scroll hijacking*: tudo usa a rolagem nativa. Com `prefers-reduced-motion` ativo, os deslocamentos são removidos e o conteúdo continua visível. Sem JavaScript, o conteúdo também aparece normalmente.

---

## 2. Executar localmente

Requisitos: Node.js 20.9 ou superior.

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000
npm run build && npm start   # build de produção
npm run typecheck            # verificação de tipos
```

---

## 3. Arquitetura

```
src/
├── app/
│   ├── layout.tsx            fontes, metadados/SEO, JSON-LD, provider de animação
│   ├── page.tsx              composição das seções
│   ├── globals.css           tokens da marca (Tailwind v4 @theme) e estilos base
│   ├── opengraph-image.tsx   imagem de compartilhamento gerada no build
│   ├── privacidade/page.tsx  política de privacidade (texto-base)
│   ├── not-found.tsx         página 404
│   ├── robots.ts / sitemap.ts
├── content/                  ← TODO O CONTEÚDO EDITÁVEL
│   ├── site.ts               dados da empresa, contato, navegação, hero, problema, conversão
│   ├── services.ts           as 4 áreas de atuação
│   ├── projects.ts           portfólio / estudos de caso
│   ├── proofs.ts             depoimentos, métricas, prints, vídeos
│   ├── founder.ts            texto e foto do fundador
│   └── methodology.ts        as 4 etapas
├── lib/
│   ├── contact.ts            links de WhatsApp, formatação da mensagem do formulário
│   └── visibility.ts         regras do que pode ser publicado (placeholders, autorizações)
└── components/
    ├── layout/               Header (menu fixo, menu mobile, barra de progresso), Footer
    ├── sections/             Hero, Problem, Services, Projects, Methodology, Proofs, Founder, Contact, LeadForm
    ├── ui/                   ButtonLink, Logo, SectionIntro, motion (Reveal, LineReveal, ImageReveal)
    └── providers/            MotionProvider (respeita redução de movimento)
```

Os componentes não guardam texto de negócio, telefone nem link fixo. Tudo isso fica em `src/content/`.

---

## 4. Pontos de substituição (placeholders)

| O quê | Onde | Como |
|---|---|---|
| **Logo oficial** | `src/content/site.ts` → `site.logo` | Salve o arquivo original em `public/brand/` (SVG de preferência) e preencha `src`, `width` e `height`. Enquanto isso, aparece apenas o nome em texto, sem nenhum símbolo substituto. |
| **Paleta** | `src/app/globals.css` → `@theme` | Ajuste `--color-gold` e `--color-gold-light` para os valores exatos da logo. Os demais tons derivam desses. |
| **WhatsApp** | variável `NEXT_PUBLIC_WHATSAPP_NUMBER` | Somente dígitos, no formato `55` + DDD + número. Sem número configurado, os botões levam ao Direct do Instagram e o formulário explica isso ao visitante. |
| **URL do site** | variável `NEXT_PUBLIC_SITE_URL` | Usada no SEO, no Open Graph e no sitemap. |
| **Foto do fundador** | `src/content/founder.ts` → `photo` | Salve em `public/founder/` (retrato 4:5, por exemplo 1200×1500). |
| **Texto do fundador** | `src/content/founder.ts` | Escrito sem credenciais, anos de experiência ou formação. **Revise** e complemente apenas com fatos. |
| **Projetos** | `src/content/projects.ts` | Há um modelo comentado no fim do arquivo. Imagens vão em `public/projects/<id>/`. |
| **Provas sociais** | `src/content/proofs.ts` | Só aparece item com `verified: true`. Depoimentos também exigem `authorized: true`. |
| **Política de privacidade** | `src/app/privacidade/page.tsx` | Texto-base. Revise com assessoria jurídica e acrescente os dados do controlador quando houver. |

### Modo publicação

Em `src/content/site.ts`, `showPlaceholders: true` mostra os espaços reservados, sempre identificados como "Placeholder".

Mude para **`false`** antes de divulgar o site. Com isso:
- projetos com status `em-documentacao` somem; se não sobrar nenhum, a seção inteira e o link "Projetos" do menu e do hero saem;
- a seção de resultados só aparece se houver prova verificada;
- o espaço da foto do fundador some até a foto real ser cadastrada;
- a numeração das seções se ajusta, sem saltos.

### Regras de honestidade aplicadas pelo código

- O **nome do cliente** só aparece com `disclosure.clientNameAuthorized: true`. Sem isso, o projeto aparece pelo setor (por exemplo, "Projeto em varejo pet"). Por isso Petshop Palmares e Casa Prates ainda não aparecem com nome.
- **Imagens** e **link** de projeto também dependem de autorização própria (`imagesAuthorized`, `linkAuthorized`).
- O campo **"Resultado comprovado"** só é exibido quando preenchido.
- Métricas exigem o campo `source`, com a origem do número.

---

## 5. Contato e formulário

O formulário **não simula envio**. Ele valida os campos (nome, empresa, WhatsApp com DDD, serviço, desafio e consentimento), monta uma mensagem formatada no próprio navegador e:
- **com WhatsApp configurado:** abre `wa.me` com a mensagem pronta, e o visitante confirma o envio por lá;
- **sem WhatsApp:** copia a mensagem e abre o Direct do Instagram. Se a cópia falhar, a mensagem aparece na tela para o visitante copiar à mão.

O visitante vê o que vai acontecer antes de enviar, e o site não armazena nenhum dado. Se no futuro houver backend (e-mail ou CRM), basta trocar a função `onSubmit` em `LeadForm.tsx`.

---

## 6. Prévias do novo hero (direção 2026)

As duas alternativas em avaliação ficam em rotas separadas. A página inicial não muda.

| Rota | Alternativa | O que faz |
|---|---|---|
| `/prototipo/a` | **A — Rede** | Pontos se organizam numa estrutura conectada. Pulsos percorrem as conexões, uma varredura passa pela rede, o toque gera um anel que acende os pontos e o scroll abre a rede em profundidade. |
| `/prototipo/b` | **B — Camadas** | Quatro planos 3D, um por pilar, pousam em sequência. A estrutura gira levemente, um plano dourado atravessa as camadas, o cursor inclina e o scroll afasta as camadas. No celular, botões destacam cada pilar. |

As duas rotas ficam fora dos buscadores (`noindex`). O código fica em `src/components/hero-lab/`, e o texto em `src/content/hero-2026.ts`.

---

## 7. Publicação pelo iPhone (GitHub + Vercel)

Não é preciso instalar nada no aparelho: o build roda nos servidores do GitHub e da Vercel.

1. **GitHub.** Crie uma conta em github.com pelo Safari. O repositório pode ser criado com a ajuda do Claude, que envia os arquivos direto para ele.
2. **Validação automática.** A cada envio, o GitHub Actions (`.github/workflows/ci.yml`) instala as dependências, roda `npm run build` e `npm run typecheck`. O resultado aparece na aba **Actions** do repositório, com um ✓ verde ou um ✗ vermelho.
3. **Vercel.** Entre em vercel.com com a conta do GitHub, toque em **Add New → Project** e importe o repositório. O Next.js é detectado sozinho.
4. **Variáveis.** Em **Settings → Environment Variables**, cadastre `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_WHATSAPP_NUMBER`.
5. **Prévias.** Cada envio gera uma URL de prévia na Vercel. É por ela que você compara `/prototipo/a` e `/prototipo/b` no celular.
6. **Domínio.** Em **Settings → Domains**. Depois, atualize `NEXT_PUBLIC_SITE_URL` e faça um novo deploy.

> As variáveis `NEXT_PUBLIC_*` entram no código no momento do build. Se alterar alguma, é preciso fazer um novo deploy.

---

## 8. Status de verificação

O ambiente de desenvolvimento não tem acesso ao registro npm, então o build real ainda **não** foi executado. **O projeto só deve ser considerado validado depois que o primeiro build no GitHub Actions ou na Vercel passar.**

As versões do `package.json` foram conferidas no registro npm em 13/10/2026 (`next 16.4`, `motion 12.23`, `lucide-react 0.540`, `tailwindcss 4.3`).

**Já verificado, com renderização real no Chromium:**
- todos os componentes compilam e são exibidos em 1440px e 390px, sem rolagem horizontal nem erros de JavaScript;
- canvas, CSS 3D, toque, scroll e redução de movimento nas duas alternativas;
- nenhum link quebrado.

Nessa renderização, a biblioteca Motion foi substituída por uma versão simplificada que anima com transições CSS.
