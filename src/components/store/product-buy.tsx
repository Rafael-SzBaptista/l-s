"use client";

import { Pop } from "@/components/motion/reveal";
import { buttonFill } from "@/lib/ui";
import type { Product } from "@/lib/products";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { Check } from "lucide-react";
import { useState } from "react";
import { useBag } from "./bag";

export function ProductBuy({ product }: { product: Product }) {
  const bag = useBag();
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "");
  const [added, setAdded] = useState(false);
  const controls = useAnimation();

  async function add() {
    if (!size) {
      await controls.start({
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.45 },
      });
      return;
    }
    bag.add(product.slug, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="mt-8">
      <p className="eyebrow mb-3">Tamanho</p>
      <motion.div animate={controls} className="flex flex-wrap gap-2">
        {product.sizes.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSize(item)}
            className="relative min-w-14 px-4 py-3 font-mono text-sm"
          >
            {size === item ? (
              <motion.span
                layoutId={`size-${product.slug}`}
                className="absolute inset-0 border border-ink"
              />
            ) : (
              <span className="absolute inset-0 border border-line" />
            )}
            <span className="relative">{item}</span>
          </button>
        ))}
      </motion.div>
      <button type="button" className={`${buttonFill} mt-8 w-full`} onClick={add}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={added ? "ok" : "add"}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
          >
            {added ? "Adicionado" : "Adicionar à sacola"}
          </motion.span>
        </AnimatePresence>
        {added ? (
          <Pop>
            <Check strokeWidth={1.5} className="h-4 w-4" />
          </Pop>
        ) : null}
      </button>
    </div>
  );
}
