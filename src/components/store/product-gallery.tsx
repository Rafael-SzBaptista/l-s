"use client";

import { useLockScroll } from "@/components/motion/use-lock-scroll";
import { easeOut } from "@/components/motion/ease";
import type { Product } from "@/lib/products";
import { CARD_SIZES } from "./product-card";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ViewTransition } from "react";

export function ProductGallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const image = product.images[index];

  return (
    <div>
      <button
        type="button"
        className="block w-full text-left"
        data-cursor="Ver"
        onClick={() => setOpen(true)}
      >
        <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
          <div className="relative aspect-[4/5] overflow-hidden bg-raised">
            {/* Mesma URL do card, já em cache: a transição encontra a foto pronta
                em vez de um quadro vazio enquanto a versão grande carrega. */}
            <Image
              src={product.images[0].src}
              alt=""
              fill
              sizes={CARD_SIZES}
              className="campaign-photo object-cover"
              style={{ objectPosition: product.images[0].position }}
            />
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="campaign-photo object-cover"
              style={{ objectPosition: image.position }}
            />
          </div>
        </ViewTransition>
      </button>
      {product.images.length > 1 ? (
        <div className="mt-3 flex gap-3">
          {product.images.map((item, itemIndex) => (
            <button
              key={item.src}
              type="button"
              aria-label={`Foto ${itemIndex + 1}`}
              onClick={() => setIndex(itemIndex)}
              className={`relative h-20 w-16 bg-raised ${itemIndex === index ? "outline outline-1 outline-accent" : "opacity-60"}`}
            >
              <Image
                src={item.src}
                alt=""
                fill
                sizes="64px"
                className="campaign-photo object-cover"
                style={{ objectPosition: item.position }}
              />
            </button>
          ))}
        </div>
      ) : null}
      <Lightbox
        product={product}
        open={open}
        index={index}
        setIndex={setIndex}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

function Lightbox({
  product,
  open,
  index,
  setIndex,
  onClose,
}: {
  product: Product;
  open: boolean;
  index: number;
  setIndex: (index: number) => void;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  useLockScroll(open);
  const image = product.images[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") {
        setZoomed(false);
        setIndex((index + 1) % product.images.length);
      }
      if (event.key === "ArrowLeft") {
        setZoomed(false);
        setIndex((index - 1 + product.images.length) % product.images.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, onClose, product.images.length, setIndex]);

  useEffect(() => {
    setZoomed(false);
  }, [index]);

  function point(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          className="fixed inset-0 z-[85] flex flex-col bg-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between px-5 py-5 md:px-8">
            <p className="eyebrow text-ink">
              {index + 1} / {product.images.length}
            </p>
            <button type="button" aria-label="Fechar foto" onClick={onClose}>
              <X strokeWidth={1.5} />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={image.src}
                className="relative h-[72svh] w-full max-w-5xl cursor-zoom-in overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: zoomed ? 2.2 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: easeOut }}
                style={{ transformOrigin: origin }}
                onClick={(event) => {
                  point(event);
                  setZoomed((value) => !value);
                }}
                onMouseMove={(event) => {
                  if (zoomed) point(event);
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="100vw"
                  className="campaign-photo object-contain"
                  style={{ objectPosition: image.position }}
                />
              </motion.div>
            </AnimatePresence>
            {product.images.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Foto anterior"
                  className="absolute left-4 grid h-12 w-12 place-items-center border border-line"
                  onClick={() => {
                    setZoomed(false);
                    setIndex((index - 1 + product.images.length) % product.images.length);
                  }}
                >
                  <ArrowLeft strokeWidth={1.5} className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Próxima foto"
                  className="absolute right-4 grid h-12 w-12 place-items-center border border-line"
                  onClick={() => {
                    setZoomed(false);
                    setIndex((index + 1) % product.images.length);
                  }}
                >
                  <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
                </button>
              </>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
