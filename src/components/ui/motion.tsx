"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/** Revelação suave ao entrar na tela. */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

type LinesProps = {
  lines: ReactNode[];
  className?: string;
  lineClassName?: (index: number) => string;
  delay?: number;
  stagger?: number;
  /** "mount" anima ao carregar (hero); "view" anima ao rolar. */
  trigger?: "mount" | "view";
  as?: "h1" | "h2" | "h3" | "p";
};

/** Texto revelado linha a linha, como uma cortina subindo. */
export function LineReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  trigger = "view",
  as: Tag = "h2",
}: LinesProps) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.span
            data-reveal
            className={`block ${lineClassName?.(i) ?? ""}`}
            initial={{ y: "110%", opacity: 0 }}
            {...(trigger === "mount"
              ? { animate: { y: "0%", opacity: 1 } }
              : { whileInView: { y: "0%", opacity: 1 }, viewport: VIEWPORT })}
            transition={{ duration: 1.05, delay: delay + i * stagger, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Imagem/superfície revelada de baixo para cima. */
export function ImageReveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, ease: EASE }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 1.6, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
