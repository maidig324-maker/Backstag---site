import { hero2026 } from "./hero-2026";

/**
 * Abertura cinematográfica e hero.
 * Textos definidos pelo fundador; as explicações dos pilares reaproveitam
 * as mensagens já aprovadas do topo.
 */
const blurb = (i: number) => hero2026.pillars[i].blurb;

export const opening = {
  headline: ["Sua empresa não precisa de soluções isoladas.", "Precisa de tudo funcionando junto."],
  closing: ["Quando tudo se conecta,", "sua empresa avança."],
  pillars: [
    { name: "Gestão", text: blurb(0) },
    { name: "Marketing", text: blurb(1) },
    { name: "Tecnologia", text: blurb(2) },
    { name: "Automação", text: blurb(3) },
  ],
} as const;
