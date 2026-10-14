"use client";

import { easeInOut, easeOut } from "@/components/motion/ease";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";

const items = [
  {
    title: "A coleção já está na loja?",
    body: "Sim. A Primavera-Verão 2026/27 está na loja: papetes, rasteirinhas, sandálias, scarpins, tamancos, tênis e fechados, pares de R$ 139,90 a R$ 399,90.",
  },
  {
    title: "Por que o dourado se repete?",
    body: "Para a coleção ser uma só. O metal passa das tachas da sandália às placas da rasteira e às fivelas das papetes.",
  },
  {
    title: "Como a peça fica no pé?",
    body: "Nosso grande diferencial é o conforto. A rasteirinha acompanha o chão, o bloco distribui o peso, a mule deixa o calcanhar livre. O conforto é parte do desenho, não um ajuste depois.",
  },
  {
    title: "A sacola guarda o pedido?",
    body: "Nesta visita, sim. Ela reúne tamanho e peça enquanto a página está aberta.",
  },
];

export function Accordion({
  entries,
}: {
  entries: { title: string; body: string }[];
}) {
  const [aberto, setAberto] = useState<number | null>(null);

  return (
    <div className="border-b border-line">
      {entries.map((entry, index) => (
        <AccordionItem
          key={entry.title}
          entry={entry}
          open={aberto === index}
          onToggle={() => setAberto((atual) => (atual === index ? null : index))}
        />
      ))}
    </div>
  );
}

function AccordionItem({
  entry,
  open,
  onToggle,
}: {
  entry: { title: string; body: string };
  open: boolean;
  onToggle: () => void;
}) {
  const id = useId();

  return (
    <div className="border-t border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-6 py-6 text-left text-lg"
      >
        <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
          {entry.title}
        </span>
        {/* O "+" gira 45° e vira "×" ao abrir. */}
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="grid h-8 w-8 shrink-0 place-items-center"
        >
          <Plus strokeWidth={1.5} className="h-4 w-4" />
        </motion.span>
      </button>
      {/* Altura anima nos dois sentidos; o texto desliza e aparece por cima. */}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            key="corpo"
            initial={{ height: 0 }}
            animate={{ height: "auto", transition: { duration: 0.55, ease: easeOut } }}
            exit={{ height: 0, transition: { duration: 0.45, ease: easeInOut } }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut, delay: 0.08 } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.25, ease: easeInOut } }}
              className="max-w-2xl pb-6 leading-relaxed text-muted"
            >
              {entry.body}
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <section className="px-5 py-24 md:px-10 md:py-32">
      <h2 className="font-wide mb-10 text-[clamp(2.8rem,6vw,5rem)]">Perguntas da coleção</h2>
      <Accordion entries={items} />
    </section>
  );
}
