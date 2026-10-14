"use client";

import { formatPrice } from "@/lib/utils";
import { getProduct, type Product } from "@/lib/products";
import { useLockScroll } from "@/components/motion/use-lock-scroll";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { createContext, useContext, useMemo, useState } from "react";
import { easeInOut } from "@/components/motion/ease";

export type BagLine = {
  slug: string;
  size: string;
  qty: number;
};

type BagContextValue = {
  lines: BagLine[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (slug: string, size: string) => void;
  remove: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
};

const BagContext = createContext<BagContextValue | null>(null);

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [open, setOpen] = useState(false);
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const total = lines.reduce((sum, line) => {
    const product = getProduct(line.slug);
    return sum + (product ? product.price * line.qty : 0);
  }, 0);

  const value = useMemo<BagContextValue>(
    () => ({
      lines,
      count,
      total,
      open,
      setOpen,
      add: (slug, size) => {
        setLines((current) => {
          const found = current.find((line) => line.slug === slug && line.size === size);
          if (!found) return [...current, { slug, size, qty: 1 }];
          return current.map((line) =>
            line.slug === slug && line.size === size ? { ...line, qty: line.qty + 1 } : line,
          );
        });
      },
      remove: (slug, size) => {
        setLines((current) => current.filter((line) => !(line.slug === slug && line.size === size)));
      },
      setQty: (slug, size, qty) => {
        setLines((current) =>
          qty <= 0
            ? current.filter((line) => !(line.slug === slug && line.size === size))
            : current.map((line) =>
                line.slug === slug && line.size === size ? { ...line, qty } : line,
              ),
        );
      },
    }),
    [lines, count, total, open],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const value = useContext(BagContext);
  if (!value) throw new Error("Sacola fora do provider");
  return value;
}

function Qty({ value }: { value: number }) {
  return (
    <span className="relative inline-grid h-5 overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function BagDrawer() {
  const bag = useBag();
  useLockScroll(bag.open);

  return (
    <AnimatePresence>
      {bag.open ? (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            aria-label="Fechar sacola"
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => bag.setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Sacola"
            className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-raised"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: easeInOut }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <p className="eyebrow text-ink">
                Sacola · <Qty value={bag.count} />
              </p>
              <button type="button" aria-label="Fechar" onClick={() => bag.setOpen(false)}>
                <X strokeWidth={1.5} />
              </button>
            </div>
            <ul data-lenis-prevent className="thin-scrollbar flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <AnimatePresence initial={false}>
                {bag.lines.length === 0 ? (
                  <motion.li
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-16 text-center text-muted"
                  >
                    A sacola está vazia. A coleção espera o próximo passo.
                  </motion.li>
                ) : (
                  bag.lines.map((line) => {
                    const product = getProduct(line.slug);
                    if (!product) return null;
                    return (
                      <BagItem
                        key={`${line.slug}-${line.size}`}
                        product={product}
                        line={line}
                      />
                    );
                  })
                )}
              </AnimatePresence>
            </ul>
            <div className="border-t border-line px-6 py-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="eyebrow">Nesta visita</span>
                <span className="font-mono">{formatPrice(bag.total)}</span>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                A sacola guarda a escolha enquanto esta página estiver aberta.
              </p>
              <button
                type="button"
                className="mt-6 w-full border border-line py-4 font-mono text-[0.68rem] uppercase tracking-[0.18em]"
                onClick={() => bag.setOpen(false)}
              >
                Continuar olhando
              </button>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function BagItem({ product, line }: { product: Product; line: BagLine }) {
  const bag = useBag();
  const image = product.images[0];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ x: 80, opacity: 0 }}
      className="flex gap-4"
    >
      <div className="relative h-28 w-24 shrink-0 bg-surface">
        <Image
          src={image.src}
          alt=""
          fill
          sizes="96px"
          className="campaign-photo object-cover"
          style={{ objectPosition: image.position }}
        />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p>{product.name}</p>
            <p className="eyebrow mt-2">Tam. {line.size}</p>
          </div>
          <button
            type="button"
            className="eyebrow text-ink"
            onClick={() => bag.remove(line.slug, line.size)}
          >
            Tirar
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-3 border border-line px-2 py-1">
            <button
              type="button"
              aria-label="Diminuir"
              onClick={() => bag.setQty(line.slug, line.size, line.qty - 1)}
            >
              <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <Qty value={line.qty} />
            <button
              type="button"
              aria-label="Aumentar"
              onClick={() => bag.setQty(line.slug, line.size, line.qty + 1)}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
          <p className="font-mono text-sm">{formatPrice(product.price * line.qty)}</p>
        </div>
      </div>
    </motion.li>
  );
}
