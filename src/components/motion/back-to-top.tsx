"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { useMotionValueEvent } from "motion/react";
import { useReducedMotion } from "./use-media-query";

export function BackToTop() {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const { scrollY, scrollYProgress } = useScroll();
  const path = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const [show, setShow] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    setShow(value > 800);
  });

  return (
    <AnimatePresence mode="popLayout">
      {show ? (
        <motion.button
          layout
          type="button"
          aria-label="Voltar ao topo"
          className="relative grid h-14 w-14 place-items-center rounded-full bg-surface/85 text-ink backdrop-blur-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.45 }}
          onClick={() => {
            if (lenis) lenis.scrollTo(0);
            else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0" aria-hidden>
            <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(241,238,232,0.16)" strokeWidth="1.5" />
            <motion.circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="#c6a15b"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ pathLength: path }}
              transform="rotate(-90 24 24)"
            />
          </svg>
          <ArrowUp strokeWidth={1.5} className="relative h-4 w-4" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
