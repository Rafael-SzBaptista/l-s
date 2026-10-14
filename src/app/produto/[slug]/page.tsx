import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SplitText } from "@/components/motion/reveal";
import { Accordion } from "@/components/store/faq";
import { ProductBuy } from "@/components/store/product-buy";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { formatPrice } from "@/lib/utils";
import { getProduct, products, relatedProducts } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Peça" };
  return { title: product.name, description: product.summary };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = relatedProducts(product.slug);

  return (
    <article className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <ProductGallery product={product} />
        </div>
        <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <p className="eyebrow">{product.category}</p>
          <SplitText
            as="h1"
            text={product.name}
            className="font-wide mt-3 text-[clamp(3rem,6vw,5.4rem)]"
          />
          <p className="mt-6 font-mono text-xl">{formatPrice(product.price)}</p>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{product.description}</p>
          <ProductBuy product={product} />
          <div className="mt-12">
            <Accordion entries={product.details} />
          </div>
        </div>
      </div>
      <section className="mt-28">
        <p className="eyebrow">Continua</p>
        <h2 className="font-wide mt-4 mb-10 text-[clamp(2.6rem,5vw,4.5rem)]">Outras peças</h2>
        <div className="grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </article>
  );
}
