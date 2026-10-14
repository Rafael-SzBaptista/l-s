import { Reveal, RevealImage, ScrollWords } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { RollText } from "@/components/motion/roll-text";
import { buttonFill } from "@/lib/ui";
import Link from "next/link";

export function Manifesto() {
  return (
    <section id="manifesto" className="px-5 py-[18vh] md:px-16 md:py-[22vh]">
      <p className="eyebrow">01 — Manifesto</p>
      <ScrollWords
        text="Nada por acaso. Cada detalhe pensado para o seu passo. Uma coleção feita a partir de conforto e modernidade."
        className="font-wide mt-8 max-w-6xl text-[clamp(2.1rem,5.4vw,5rem)]"
      />
    </section>
  );
}

export function Editorial() {
  return (
    <section className="grid items-stretch gap-10 px-5 py-12 md:px-10 lg:grid-cols-12 lg:py-24">
      <RevealImage
        src="/catalogo/papete-corrente-ouro-1.jpg"
        alt="Papete dourada de tiras trançadas, com saia de crochê."
        parallax
        className="min-h-[70svh] lg:col-span-7"
        sizes="(min-width: 1024px) 58vw, 100vw"
        position="center 70%"
      />
      <div className="flex flex-col justify-end lg:col-span-5 lg:py-10">
        <p className="eyebrow">04 — Editorial</p>
        <Reveal>
          <h2 className="font-wide mt-5 text-[clamp(2.8rem,5vw,4.8rem)]">
            O passo que fica.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            A coleção saiu para o passo. Couro, metal dourado e um salto que não pede licença.
          </p>
        </Reveal>
        <Magnetic className="mt-8 inline-flex">
          <Link href="/sobre" className={buttonFill} data-cursor="Abrir">
            <RollText>Ler a marca</RollText>
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}
