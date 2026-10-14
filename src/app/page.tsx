import { Editorial, Manifesto } from "@/components/store/editorial";
import { Faq } from "@/components/store/faq";
import { Hero } from "@/components/store/hero";
import { HorizontalLooks } from "@/components/store/horizontal-looks";
import { ProductBand } from "@/components/store/product-band";
import { VelocityMarquee } from "@/components/motion/velocity-marquee";

export default function HomePage() {
  return (
    <>
      <Hero />
      <VelocityMarquee text="Nada por acaso — Cada detalhe — Conforto — Modernidade — Lés by Sabongi" />
      <Manifesto />
      <HorizontalLooks />
      <ProductBand />
      <Editorial />
      <Faq />
    </>
  );
}
