import type { Metadata } from "next";
import { SplitText } from "@/components/motion/reveal";
import { CollectionBrowser } from "@/components/store/collection-browser";

export const metadata: Metadata = {
  title: "Coleção",
  description: "Papetes, rasteirinhas, sandálias, scarpins, tamancos e tênis. A coleção Primavera-Verão 2026/27 Lés by Sabongi.",
};

export default function CollectionPage() {
  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <p className="eyebrow">Na loja</p>
      <SplitText
        as="h1"
        text="A coleção"
        className="font-wide mt-4 text-[clamp(4rem,12vw,9rem)]"
      />
      <p className="mt-6 max-w-xl text-lg text-muted">
        Primavera-Verão 2026/27. Do dia a dia ao casual, pares de R$ 139,90 a R$ 399,90.
      </p>
      <div className="mt-12">
        <CollectionBrowser />
      </div>
    </div>
  );
}
