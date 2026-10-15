/**
 * Topo: notebook e celular realistas mostrando o trabalho na tela.
 * Cada pilar do topo troca o que aparece nas duas telas:
 *  0 Gestão         → quadro de processos (cartões andando entre etapas)
 *  1 Marketing      → perfil e feed com as fotos reais dos projetos
 *  2 Digital        → o próprio site da Backstag rolando
 *  3 IA e automação → atendimento automático no WhatsApp
 * As telas são ilustrativas: nenhum número, cliente ou resultado inventado.
 */
import { hero2026 } from "@/content/hero-2026";

const PHOTOS = [
  "/proofs/ecommerce-etiquetas-poster.jpg",
  "/projects/casa-prates/linha-producao-poster.jpg",
  "/projects/varejo-atacado-pet/operacao-poster.jpg",
  "/projects/delivery-street-food/cozinha-poster.jpg",
];

function Kanban() {
  const cols = ["A fazer", "Em andamento", "Concluído"];
  return (
    <div className="dv-pad dv-kanban">
      <div className="dv-topbar">
        <span className="dv-brand">Operação</span>
        <span className="dv-pill">Processos</span>
      </div>
      <div className="dv-cols">
        {cols.map((c, i) => (
          <div key={c} className="dv-col">
            <span className="dv-col-t">{c}</span>
            {[0, 1, 2].map((k) => (
              <span key={k} className={`dv-card ${i === 2 ? "dv-card-ok" : ""}`} />
            ))}
          </div>
        ))}
        {/* cartão que anda de uma etapa para a outra */}
        <span className="dv-card dv-card-move" />
      </div>
    </div>
  );
}

function Feed({ compact = false }: { compact?: boolean }) {
  return (
    <div className="dv-pad">
      <div className="dv-profile">
        <span className="dv-avatar" />
        <span className="dv-lines">
          <span />
          <span />
        </span>
      </div>
      <div className={`dv-grid ${compact ? "dv-grid-2" : ""}`}>
        {[...PHOTOS, ...PHOTOS].slice(0, compact ? 4 : 8).map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt="" loading="lazy" decoding="async" />
        ))}
      </div>
    </div>
  );
}

function SiteMini({ mobile = false }: { mobile?: boolean }) {
  const [a, b] = hero2026.headline;
  return (
    <div className={`dv-site ${mobile ? "dv-site-m" : ""}`}>
      <div className="dv-scroll">
        <div className="dv-s-nav">
          <span className="dv-s-logo">BACKSTAG</span>
          <span className="dv-s-cta">WhatsApp</span>
        </div>
        <div className="dv-s-hero">
          <span className="dv-s-h1">
            {a}
            <br />
            {b.replace("além.", "")}
            <em>além.</em>
          </span>
          <span className="dv-s-btn">Conversar pelo WhatsApp</span>
        </div>
        <div className="dv-s-cards">
          {PHOTOS.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" loading="lazy" decoding="async" />
          ))}
        </div>
        <div className="dv-s-block" />
        <div className="dv-s-block dv-s-block-2" />
      </div>
    </div>
  );
}

function Chat() {
  return (
    <div className="dv-chat">
      <div className="dv-chat-top">
        <span className="dv-avatar" />
        <span>Atendimento</span>
      </div>
      <div className="dv-msgs">
        <span className="dv-msg dv-in">Olá! Quero fazer um pedido.</span>
        <span className="dv-msg dv-out">Oi! Já te ajudo. Qual produto você procura?</span>
        <span className="dv-msg dv-in">Quero saber o prazo de entrega.</span>
        <span className="dv-msg dv-out dv-typing">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}

function Flow() {
  return (
    <div className="dv-pad dv-flow">
      {["Mensagem", "Cadastro", "Pedido", "Entrega"].map((t, i) => (
        <span key={t} className="dv-node" style={{ ["--i" as string]: i }}>
          {t}
        </span>
      ))}
      <span className="dv-flow-line" />
    </div>
  );
}

const LAPTOP = [<Kanban key="k" />, <Feed key="f" />, <SiteMini key="s" />, <Flow key="w" />];
const PHONE = [<Kanban key="k" />, <Feed key="f" compact />, <SiteMini key="s" mobile />, <Chat key="c" />];

export function DeviceShowcase({ index }: { index: number }) {
  return (
    <div className="dv" aria-hidden>
      <div className="dv-rig">
        {/* notebook */}
        <div className="dv-laptop">
          <div className="dv-lid">
            <span className="dv-cam" />
            <div className="dv-screen">
              <div className="dv-urlbar">
                <i />
                <i />
                <i />
                <span>suaempresa.com.br</span>
              </div>
              <div className="dv-view">
                {LAPTOP.map((s, i) => (
                  <div key={i} className={`dv-scr ${i === index ? "dv-on" : ""}`}>
                    {s}
                  </div>
                ))}
              </div>
              <span className="dv-glare" />
            </div>
          </div>
          <div className="dv-base">
            <span className="dv-notch" />
          </div>
          <span className="dv-shadow" />
        </div>

        {/* celular */}
        <div className="dv-phone">
          <div className="dv-pscreen">
            <span className="dv-island" />
            {PHONE.map((s, i) => (
              <div key={i} className={`dv-scr ${i === index ? "dv-on" : ""}`}>
                {s}
              </div>
            ))}
            <span className="dv-glare" />
          </div>
        </div>
      </div>
    </div>
  );
}
