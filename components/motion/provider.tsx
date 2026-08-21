"use client";

import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Import `m` from framer-motion, never `motion`. `strict` throws if anyone
 * forgets — that mistake costs ~34KB on the initial bundle.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
