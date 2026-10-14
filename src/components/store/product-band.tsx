import { SplitText } from "@/components/motion/reveal";
import { featuredProducts } from "@/lib/products";
import Link from "next/link";
import { ProductCard } from "./product-card";
import { RollText } from "@/components/motion/roll-text";

export function ProductBand() {
  return (
    <section className="px-5 py-24 md:px-10 md:py-36" aria-labelledby="chegados-title">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <SplitText
            as="h2"
            text="Recém-chegados"
            className="font-wide text-[clamp(2.4rem,7vw,6rem)]"
          />
        </div>
        <Link href="/colecao" data-cursor="Abrir" className="group hidden font-mono text-[0.68rem] uppercase tracking-[0.18em] md:inline-flex">
          <RollText>Ver tudo</RollText>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
        {featuredProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
