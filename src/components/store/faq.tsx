"use client";

import { Plus } from "lucide-react";

const items = [
  {
    title: "A coleção já está na loja?",
    body: "Sim. A Primavera-Verão 2026/27 está na loja: papetes, rasteirinhas, sandálias, scarpins, tamancos, tênis e fechados, cada par a R$ 250,00.",
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
  return (
    <div className="border-b border-line">
      {entries.map((entry) => (
        <details key={entry.title} className="border-t border-line">
          <summary className="flex items-center justify-between gap-6 py-6 text-lg">
            {entry.title}
            <Plus strokeWidth={1.5} className="acc-icon h-4 w-4 shrink-0" />
          </summary>
          <div className="acc-body">
            <p className="max-w-2xl pb-6 leading-relaxed text-muted">{entry.body}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export function Faq() {
  return (
    <section className="px-5 py-24 md:px-10 md:py-32">
      <p className="eyebrow">05 — Notas</p>
      <h2 className="font-wide mt-4 mb-10 text-[clamp(2.8rem,6vw,5rem)]">Perguntas da coleção</h2>
      <Accordion entries={items} />
    </section>
  );
}
