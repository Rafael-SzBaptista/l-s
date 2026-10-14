import { Reveal } from "@/components/motion/reveal";

const notes = [
  {
    label: "Couro",
    text: "Coleção feita predominantemente em couro legítimo, com poucos modelos em sintéticos selecionados.",
  },
  {
    label: "Metal",
    text: "Tachas, placas, fivelas e pedras: o dourado se repete de par em par.",
  },
  {
    label: "Salto",
    text: "Rasteiro no dia, bloco quando o passo pede presença, aberto quando o calcanhar quer sair.",
  },
  {
    label: "Passo",
    text: "A coleção está na loja. O desenho se prova no uso.",
  },
];

export function House() {
  return (
    <section id="a-casa" className="border-t border-line px-5 py-24 md:px-10 md:py-36">
      <p className="eyebrow">A casa</p>
      <h2 className="font-wide mt-5 max-w-5xl text-[clamp(3rem,8vw,7rem)]">Feita para ficar.</h2>
      <p className="mt-6 max-w-xl text-lg text-muted">
        Feita para diferentes mulheres, idades, estilos e momentos. Do dia a dia ao casual, agora na loja.
      </p>
      <dl className="mt-16 grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
        {notes.map((note, index) => (
          <Reveal key={note.label} delay={index * 0.06} className="bg-surface px-6 py-10">
            <dt className="eyebrow">{note.label}</dt>
            <dd className="mt-6 text-lg leading-relaxed">{note.text}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
