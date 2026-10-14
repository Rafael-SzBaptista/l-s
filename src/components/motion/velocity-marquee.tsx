"use client";

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

export function VelocityMarquee({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "120px" });
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 80, damping: 28, mass: 0.5 });
  const skew = useTransform(smooth, [-1400, 0, 1400], [-2, 0, 2]);
  const x = useTransform(base, (value) => `${wrap(-50, 0, value)}%`);

  useAnimationFrame((_, delta) => {
    if (!inView) return;
    const speed = smooth.get();
    const direction = speed < -40 ? -1 : 1;
    const extra = Math.min(Math.abs(speed) / 2400, 0.45);
    base.set(base.get() + direction * delta * 0.0015 * (1 + extra));
  });

  const line = `${text} — `;

  return (
    <div ref={ref} className="overflow-hidden border-y border-line py-6" aria-hidden>
      <motion.div style={{ x, skewX: skew }} className="flex w-max whitespace-nowrap will-change-transform">
        {[0, 1].map((copy) => (
          <p key={copy} className="font-wide px-3 text-[clamp(2.5rem,7.4vw,6.8rem)]">
            {line.repeat(2)}
          </p>
        ))}
      </motion.div>
    </div>
  );
}
