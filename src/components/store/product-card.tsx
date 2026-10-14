"use client";

import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/products";
import { useState, ViewTransition } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";

export const CARD_SIZES = "(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw";

export function ProductCard({ product }: { product: Product }) {
  const [first, second] = product.images;
  // Só o card clicado ganha o nome da transição. Com o nome fixo, todo card da
  // grade casava com o mesmo produto em "Outras peças" e voava junto.
  const [morph, setMorph] = useState(false);

  return (
    <article className="reveal-card">
      <Link
        href={`/produto/${product.slug}`}
        data-cursor="Ver"
        className="group block"
        onClick={() => flushSync(() => setMorph(true))}
      >
        <ViewTransition
          name={morph ? `product-${product.slug}` : undefined}
          share="morph"
          default="none"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-raised">
            <Image
              src={first.src}
              alt={first.alt}
              fill
              sizes={CARD_SIZES}
              className="campaign-photo object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              style={{ objectPosition: first.position }}
            />
            {second ? (
              <Image
                src={second.src}
                alt=""
                fill
                sizes={CARD_SIZES}
                className="campaign-photo object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{ objectPosition: second.position }}
              />
            ) : null}
          </div>
        </ViewTransition>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="link-line text-lg">{product.name}</h3>
          <p className="font-mono text-sm">{formatPrice(product.price)}</p>
        </div>
        <p className="eyebrow mt-3">{product.category}</p>
      </Link>
    </article>
  );
}
