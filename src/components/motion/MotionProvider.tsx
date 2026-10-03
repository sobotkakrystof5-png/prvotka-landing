"use client";

import { LazyMotion, MotionConfig } from "motion/react";

/**
 * Motion s `LazyMotion`: animační funkce (`domAnimation`) se stáhnou
 * asynchronně až po prvním vykreslení, aby nesoutěžily s obsahem o přenos.
 * `strict` hlídá, že se používají jen lehké komponenty `m.*`.
 * `reducedMotion="user"` respektuje `prefers-reduced-motion` u všech animací.
 */
const loadFeatures = () => import("./motionFeatures").then((module) => module.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
