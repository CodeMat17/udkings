"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Index within a stagger group. 60ms apart, as the motion language specifies. */
  index?: number;
  as?: "div" | "section" | "li" | "article" | "header";
};

/**
 * Scroll reveal: 12px rise + fade, once. Nothing rotates, nothing bounces.
 *
 * Deliberately not Framer — this component appears on nearly every route, and
 * an animation library on every route is a performance-budget item. An
 * IntersectionObserver plus two CSS properties does the same job for nothing.
 * `prefers-reduced-motion` is handled in CSS, so the element simply renders as
 * its final frame.
 */
export function Reveal({ children, className, index = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  // Browsers without IntersectionObserver (below our support baseline) simply
  // start in the revealed state rather than animating.
  const [shown, setShown] = useState(
    () => typeof window !== "undefined" && !("IntersectionObserver" in window),
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // The ref type differs per tag; the observer only ever reads the node.
      ref={ref as React.Ref<never>}
      data-reveal={shown ? "in" : "out"}
      style={{ transitionDelay: `${index * 60}ms` }}
      className={className}
    >
      {children}
    </Tag>
  );
}
