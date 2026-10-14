"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const looks = [
  {
    index: "01",
    title: "Papete",
    text: "A flor prata no peito do pé.",
    src: "/catalogo/papete-flor-prata-1.jpg",
    href: "/produto/papete-flor-prata",
    position: "center 75%",
  },
  {
    index: "02",
    title: "Bloco",
    text: "O salto que segura o dia inteiro.",
    src: "/catalogo/sandalia-bloco-caramelo-2.jpg",
    href: "/produto/sandalia-bloco-caramelo",
    position: "center 70%",
  },
  {
    index: "03",
    title: "Mule",
    text: "Trama rosé, calcanhar livre.",
    src: "/catalogo/mule-trama-rose-1.jpg",
    href: "/produto/mule-trama-rose",
    position: "center 60%",
  },
  {
    index: "04",
    title: "Tênis",
    text: "Retrô, para andar a cidade.",
    src: "/catalogo/tenis-retro-creme-1.jpg",
    href: "/produto/tenis-retro-creme",
    position: "center 70%",
  },
  {
    index: "05",
    title: "Sapatilha",
    text: "A trama dourada que fecha o passo.",
    src: "/catalogo/sapatilha-trama-dourada-1.jpg",
    href: "/produto/sapatilha-trama-dourada",
    position: "center 80%",
  },
];

const RUNWAY = 1.6;

export function HorizontalLooks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const progress = useMotionValue(0);
  // Mola por cima da rolagem: o trilho desliza e assenta em vez de pular a
  // cada tique da roda.
  const smoothX = useSpring(x, { stiffness: 90, damping: 26, mass: 0.7 });
  const smoothProgress = useSpring(progress, { stiffness: 90, damping: 26, mass: 0.7 });
  const [extra, setExtra] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!track || !desktop) {
        setExtra(0);
        return;
      }
      setExtra(Math.max(0, track.scrollWidth - window.innerWidth * 0.82));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;
      if (!window.matchMedia("(min-width: 1024px)").matches) return;
      const distance = section.offsetHeight - window.innerHeight;
      if (distance <= 0) {
        x.set(0);
        progress.set(0);
        return;
      }
      const top = section.getBoundingClientRect().top + window.scrollY;
      const value = Math.min(1, Math.max(0, (window.scrollY - top) / distance));
      const max = Math.max(0, track.scrollWidth - window.innerWidth * 0.82);
      x.set(-max * value);
      progress.set(value);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [extra, progress, x]);

  return (
    <section aria-labelledby="passos-title">
      <div
        ref={sectionRef}
        className="relative hidden lg:block"
        // 1.6x de pista vertical: cada pixel rolado anda menos na horizontal.
        style={{ height: `calc(100svh + ${extra * RUNWAY}px)` }}
      >
        <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
          <div className="mb-8 flex items-end justify-between px-8 xl:px-12">
            <div>
              <p className="eyebrow">02 — Sequência</p>
              <h2 id="passos-title" className="font-wide mt-4 text-[clamp(3rem,6vw,5.5rem)]">
                Os passos
              </h2>
            </div>
            <p className="max-w-xs text-right text-muted">
              A rolagem vertical atravessa a coleção, uma peça de cada vez.
            </p>
          </div>
          <motion.div
            ref={trackRef}
            style={{ x: smoothX }}
            className="flex gap-6 pl-[8vw] will-change-transform"
          >
            {looks.map((look) => (
              <Look key={look.index} look={look} />
            ))}
          </motion.div>
          <div className="mx-[8vw] mt-8 h-px origin-left bg-line">
            <motion.div style={{ scaleX: smoothProgress }} className="h-px origin-left bg-accent" />
          </div>
        </div>
      </div>
      <div className="px-5 py-20 lg:hidden">
        <p className="eyebrow">02 — Sequência</p>
        <h2 className="font-wide mt-4 text-5xl">Os passos</h2>
        <div
          data-lenis-prevent
          className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
        >
          {looks.map((look) => (
            <Look key={look.index} look={look} mobile />
          ))}
        </div>
      </div>
    </section>
  );
}

function Look({
  look,
  mobile = false,
}: {
  look: (typeof looks)[number];
  mobile?: boolean;
}) {
  return (
    <Link
      href={look.href}
      data-cursor="Ver"
      className={
        mobile
          ? "w-[78vw] shrink-0 snap-center"
          : // Limitado também pela altura: a foto 4:5 fica em até ~55svh e o card
            // inteiro (foto + legenda) cabe na tela com o título da seção.
            "w-[min(28vw,44svh)] shrink-0"
      }
    >
      <article>
        <div className="relative aspect-[4/5] overflow-hidden bg-raised">
          <Image
            src={look.src}
            alt=""
            fill
            sizes={mobile ? "78vw" : "28vw"}
            className="campaign-photo object-cover transition-transform duration-700 hover:scale-105"
            style={{ objectPosition: look.position }}
          />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="font-wide text-2xl">{look.title}</h3>
          <p className="eyebrow">{look.index}</p>
        </div>
        <p className="mt-2 text-muted">{look.text}</p>
      </article>
    </Link>
  );
}
