"use client";

import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { RollText } from "@/components/motion/roll-text";
import { SplitText } from "@/components/motion/reveal";
import { easeInOut } from "@/components/motion/ease";
import { useIntroDone } from "@/components/motion/intro-state";
import { buttonOnPhoto } from "@/lib/ui";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    id: "passo",
    // Versões ampliadas (2x) das fotos do catálogo: o hero ocupa a tela cheia.
    src: "/catalogo/hero-rasteira.jpg",
    alt: "Rasteira café de dedo com placa dourada martelada.",
    position: "center 55%",
    label: "O passo",
    title: "Nada por acaso.",
    text: "Cada detalhe pensado para o seu passo.",
    href: "/colecao",
    cta: "Ver a coleção",
  },
  {
    id: "noite",
    src: "/catalogo/hero-scarpin.jpg",
    alt: "Scarpin slingback preto com bolsa preta de corrente.",
    position: "center 70%",
    label: "A noite",
    title: "O salto fino.",
    text: "Quando o dia acaba, o passo fica aberto.",
    href: "/produto/scarpin-slingback-preto",
    cta: "Ver o scarpin",
  },
  {
    id: "bloco",
    src: "/catalogo/hero-bloco.jpg",
    alt: "Sandália caramelo de salto bloco, com a modelo segurando uma bolsa.",
    position: "center 72%",
    label: "O bloco",
    title: "Conforto e modernidade.",
    text: "Uma coleção feita a partir do que fica.",
    href: "/produto/sandalia-bloco-caramelo",
    cta: "Ver a sandália",
  },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const introDone = useIntroDone();
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragX = useRef<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.62]);
  const slide = slides[index];

  useEffect(() => {
    if (!introDone || paused) return;
    const id = window.setTimeout(() => {
      setPrevious(index);
      setIndex((index + 1) % slides.length);
    }, 7000);
    return () => window.clearTimeout(id);
  }, [index, introDone, paused]);

  function go(next: number) {
    const total = slides.length;
    const value = (next + total) % total;
    setPrevious(index);
    setIndex(value);
  }

  return (
    <section
      ref={ref}
      data-hero
      data-cursor="Arrastar"
      className={`relative h-[100svh] overflow-hidden bg-surface text-white ${paused ? "hero-paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={(event) => {
        dragX.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (dragX.current == null) return;
        const delta = event.clientX - dragX.current;
        if (delta < -60) go(index + 1);
        if (delta > 60) go(index - 1);
        dragX.current = null;
      }}
    >
      <motion.div style={{ y: photoY }} className="absolute inset-0 will-change-transform">
        <Image
          src={slides[previous].src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="campaign-photo object-cover"
          style={{ objectPosition: slides[previous].position }}
        />
        <AnimatePresence>
          <motion.div
            key={slide.id}
            className="absolute inset-0 z-[1]"
            initial={previous === index ? false : { clipPath: "inset(0 0 0 100%)" }}
            animate={{ clipPath: "inset(0 0 0 0%)" }}
            transition={{ duration: 1.35, ease: easeInOut }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority
              sizes="100vw"
              className="campaign-photo animate-kenburns object-cover"
              style={{ objectPosition: slide.position }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-black/25 to-black/55" />
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-44 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
      <motion.div style={{ opacity: veil }} className="pointer-events-none absolute inset-0 bg-black" />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-5 pt-[var(--top-h)] pb-6 md:px-10 md:pb-10"
      >
        <div className="pointer-events-auto max-w-4xl">
          <SplitText
            key={slide.id}
            as="h1"
            text={slide.title}
            play={introDone}
            className="font-wide text-[clamp(2.7rem,6.2vw,6.2rem)] text-white"
          />
          <Reveal>
            <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">{slide.text}</p>
          </Reveal>
          <Magnetic className="mt-8 inline-flex">
            <Link href={slide.href} className={buttonOnPhoto} data-cursor="Abrir">
              <RollText>{slide.cta}</RollText>
            </Link>
          </Magnetic>
        </div>
        <div className="pointer-events-auto mt-8 flex items-center gap-6">
          <div className="flex items-center gap-3">
            {slides.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Slide: ${item.label}`}
                data-cursor=""
                className="h-px w-14 bg-white/30 md:w-20"
                onClick={() => go(itemIndex)}
              >
                {itemIndex === index && introDone ? (
                  <span key={`${item.id}-${index}`} className="hero-progress block h-px bg-white" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
