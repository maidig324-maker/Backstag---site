"use client";

import { MotionConfig } from "motion/react";

/**
 * reducedMotion="user": respeita a preferência do sistema operacional.
 * Com redução de movimento ativa, deslocamentos são removidos e só
 * transições de opacidade permanecem.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
