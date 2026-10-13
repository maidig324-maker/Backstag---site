import { Reveal } from "@/components/ui/motion";

/**
 * Prévia: mostra a transição do hero para o capítulo seguinte e lista
 * o que será construído após a aprovação da direção visual.
 */
const chapters = [
  ["descoberta", "02 — Descoberta", "Desafios empresariais revelados pelo scroll, com seções fixas e máscaras."],
  ["solucoes", "03 — Capacidades", "Os quatro pilares como composição interativa própria."],
  ["projetos", "04 — Experiência e projetos", "Galeria imersiva preparada para os trabalhos reais."],
  ["metodo", "05 — Metodologia", "Diagnóstico, planejamento, implementação e acompanhamento."],
  ["sobre", "06 — Conexão humana", "Douglas Nascimento, com fotografia e informações reais."],
  ["contato", "07 — Conversão", "Chamada final com integração ao WhatsApp comercial."],
] as const;

export function NextChapters() {
  return (
    <section aria-label="Capítulos seguintes" className="border-t border-line py-24 md:py-36">
      <div className="container-x">
        <Reveal>
          <p className="label-tech text-gold">Prévia de direção visual</p>
          <h2 className="display-tech mt-5 max-w-3xl text-[clamp(2.2rem,5vw,4rem)]">
            Os próximos capítulos serão construídos após a aprovação do hero.
          </h2>
        </Reveal>
        <ol className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map(([id, t, d], i) => (
            <li key={id} id={id} className="bg-ink">
              <Reveal delay={(i % 3) * 0.08} className="h-full p-6">
                <p className="label-tech text-paper/60">{t}</p>
                <p className="mt-3 text-sm leading-relaxed text-paper/80">{d}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
