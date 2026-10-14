"use client";

import { categories, products, type Category } from "@/lib/products";
import { easeExpo, easeOut } from "@/components/motion/ease";
import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { ProductCard } from "./product-card";

export function CollectionBrowser() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("Todos");
  const lenis = useLenis();
  const barRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Trocar de filtro leva ao primeiro card, logo abaixo do topo e da barra de
  // filtros. Só sobe: se a lista já começa na tela, nada se move.
  function choose(category: (typeof categories)[number]) {
    setFilter(category);
    const grid = gridRef.current;
    const bar = barRef.current;
    if (!grid || !bar) return;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
    const headerPx = header * parseFloat(getComputedStyle(document.documentElement).fontSize);
    // Subindo, o topo reaparece (sem a faixa de anúncio): conta com ele.
    const offset = headerPx + bar.offsetHeight + 24;
    const target = grid.getBoundingClientRect().top + window.scrollY - offset;
    if (window.scrollY <= target + 1) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }
  const visible =
    filter === "Todos"
      ? products
      : products.filter((product) => product.category === (filter as Category));

  return (
    <div>
      <div
        ref={barRef}
        className="sticky-under-header -mx-5 mb-12 bg-surface/95 px-5 md:-mx-10 md:px-10">
        {/* Entrada: os filtros sobem em sequência depois do título, e a linha
            de baixo se desenha da esquerda para a direita. */}
        <motion.div
          className="flex gap-2 overflow-x-auto py-4"
          initial="hidden"
          animate="shown"
          variants={{ shown: { transition: { delayChildren: 0.35, staggerChildren: 0.06 } } }}
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              type="button"
              onClick={() => choose(category)}
              className="relative px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em]"
              variants={{
                hidden: { opacity: 0, y: 14 },
                shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
              }}
            >
              {filter === category ? (
                <motion.span
                  layoutId="collection-filter"
                  className="absolute inset-0 bg-ink"
                />
              ) : null}
              <span className={`relative ${filter === category ? "text-surface" : "text-ink"}`}>
                {category}
              </span>
            </motion.button>
          ))}
        </motion.div>
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: easeExpo, delay: 0.3 }}
        />
      </div>
      <div ref={gridRef} className="grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
