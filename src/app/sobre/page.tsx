import type { Metadata } from "next";
import { Reveal, RevealImage, ScrollWords, SplitText } from "@/components/motion/reveal";
import { SandalShowcase } from "@/components/three/sandal-showcase";
import { House } from "@/components/store/house";

export const metadata: Metadata = {
  title: "A marca",
  description:
    "Décadas escolhendo calçados. A coleção Lés by Sabongi está na loja.",
};

const notes = [
  {
    index: "01",
    title: "Conforto",
    text: "A rasteira fica no chão. O bloco distribui a noite. A mule deixa o calcanhar livre.",
  },
  {
    index: "02",
    title: "Modernidade",
    text: "Linha reta, bico quadrado, salto desenhado. Nada de ornamento sem função.",
  },
  {
    index: "03",
    title: "Detalhe",
    text: "O metal dourado se repete para a coleção ser reconhecida de longe e de perto.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-28 md:pt-36">
      <section className="px-5 md:px-10">
        <p className="eyebrow">Lés by Sabongi</p>
        <SplitText
          as="h1"
          text="Depois de décadas."
          className="font-wide mt-4 max-w-5xl text-[clamp(2.4rem,8vw,7.4rem)]"
        />
      </section>
      <section className="grid items-center gap-12 px-5 py-24 md:px-16 md:py-32 lg:grid-cols-12 lg:gap-16">
        <ScrollWords
          text="Décadas escolhendo calçados. A coleção agora é a nossa. Nada por acaso. Cada detalhe pensado para o seu passo."
          className="font-wide text-[clamp(2rem,3.4vw,3.6rem)] lg:col-span-7"
        />
        <RevealImage
          src="/catalogo/papete-cabochao-terracota-2.jpg"
          alt="Modelo sentada com a papete terracota de cabochões e o mocassim da mesma cor."
          parallax
          className="aspect-[4/5] lg:col-span-5"
          sizes="(min-width: 1024px) 38vw, 100vw"
          position="center 70%"
        />
      </section>
      <section className="px-5 md:px-10">
        <SandalShowcase />
      </section>
      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="grid border-y border-line md:grid-cols-3">
          {notes.map((note) => (
            <Reveal
              key={note.index}
              className="border-line py-10 not-first:border-t md:px-8 md:py-12 md:not-first:border-t-0 md:not-first:border-l md:first:pl-0"
            >
              <p className="eyebrow text-accent">{note.index}</p>
              <h2 className="font-wide mt-6 text-[clamp(1.6rem,2.3vw,2.6rem)]">{note.title}</h2>
              <p className="mt-5 max-w-sm leading-relaxed text-muted">{note.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="grid items-center gap-10 px-5 pb-12 md:px-10 lg:grid-cols-2">
        <RevealImage
          src="/catalogo/sandalia-pelo-onca-1.jpg"
          alt="Sandália de salto bloco com estampa de onça, uma calçada e outra na mão."
          className="min-h-[80svh]"
          sizes="(min-width: 1024px) 50vw, 100vw"
          position="center 62%"
        />
        <Reveal>
          <p className="eyebrow">A noite</p>
          <h2 className="font-wide mt-4 text-[clamp(2.2rem,5vw,4.5rem)]">
            Uma coleção feita a partir de conforto e modernidade.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            O salto entra quando o dia acaba. O resto da coleção espera no chão: papetes, rasteirinhas e tênis.
          </p>
        </Reveal>
      </section>
      <House />
    </div>
  );
}
