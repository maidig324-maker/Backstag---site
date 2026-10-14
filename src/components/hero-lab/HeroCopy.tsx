"use client";

import { motion } from "motion/react";
import { ArrowDown, MessageCircle } from "lucide-react";
import { primaryContact } from "@/lib/contact";
import { hero2026 } from "@/content/hero-2026";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EASE } from "@/components/ui/motion";

/** Eyebrow com o conceito, no padrão de marcação técnica. */
export function ConceptTag({ className = "" }: { className?: string }) {
  return (
    <motion.p
      className={`label-tech flex items-center gap-3 text-gold ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
    >
      <span aria-hidden className="inline-block size-1.5 bg-gold" />
      <span lang="en">{hero2026.concept}</span>
    </motion.p>
  );
}

/** Título em blocos que sobem; "além." recebe o dourado. */
export function HeadlineTech({ className = "" }: { className?: string }) {
  const [a, b] = hero2026.headline;
  return (
    <h1 className={`display-tech ${className}`}>
      <span className="block overflow-hidden pb-[0.06em]">
        <motion.span
          data-reveal
          className="block"
          initial={{ y: "105%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
        >
          {a}
        </motion.span>
      </span>
      <span className="block overflow-hidden pb-[0.06em]">
        <motion.span
          data-reveal
          className="block"
          initial={{ y: "105%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 1.1, delay: 0.47, ease: EASE }}
        >
          {b.replace(/além\.$/, "")}
          <span className="text-gold-light">além.</span>
        </motion.span>
      </span>
    </h1>
  );
}

export function SubAndCtas({ className = "", stacked = false }: { className?: string; stacked?: boolean }) {
  const main = primaryContact();
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.95, ease: EASE }}
    >
      <p className="max-w-sm text-base leading-relaxed text-paper/75 md:text-[1.05rem]">{hero2026.sub}</p>
      <div className={`mt-7 flex flex-col gap-3 ${stacked ? "" : "sm:flex-row sm:items-center"}`}>
        <ButtonLink
          href={main.href}
          external
          icon={<MessageCircle className="size-4" strokeWidth={1.75} />}
        >
          {main.channel === "whatsapp" ? "Conversar pelo WhatsApp" : hero2026.primaryCta.label}
        </ButtonLink>
        <ButtonLink
          href={hero2026.secondaryCta.href}
          variant="ghost"
          icon={<ArrowDown className="size-4" strokeWidth={1.75} />}
        >
          {hero2026.secondaryCta.label}
        </ButtonLink>
      </div>
    </motion.div>
  );
}

/** Respeita prefers-reduced-motion em código imperativo (canvas, rAF). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
