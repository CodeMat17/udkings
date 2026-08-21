import type { Transition } from "framer-motion";

export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const spring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
};

export const dur = { fast: 0.18, base: 0.32, slow: 0.6, cinematic: 1.1 } as const;

