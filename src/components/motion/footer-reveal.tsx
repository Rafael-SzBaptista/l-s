"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * O conteúdo sobe por cima do rodapé, que fica preso no fundo da tela.
 * Enquanto o rodapé aparece, as quinas de baixo do conteúdo se arredondam.
 */
export function FooterReveal({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  // O rodapé sticky já nasce preso no fundo da tela, então quem é medido é o
  // fim do conteúdo: 0 quando ele toca o fundo da tela, 1 quando chega ao topo.
  const mainRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["end end", "end start"],
  });
  const radius = useTransform(scrollYProgress, [0, 0.5], [0, 56]);
  const shadow = useTransform(scrollYProgress, [0, 0.5], [0, 0.6], { clamp: true });
  const boxShadow = useTransform(shadow, (a) => `0 40px 80px rgba(0,0,0,${a})`);

  return (
    <>
      <motion.main
        ref={mainRef}
        className="relative z-10 overflow-clip bg-surface"
        style={{
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
          boxShadow,
        }}
      >
        {children}
      </motion.main>
      <div className="sticky bottom-0 z-0">
        {footer}
      </div>
    </>
  );
}
