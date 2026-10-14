"use client";

import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";

const SandalScene = dynamic(() => import("./sandal-scene"), {
  ssr: false,
  loading: () => null,
});

export function SandalShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { margin: "300px" });

  return (
    <div ref={ref} className="relative h-[78svh] min-h-[28rem]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between">
        <p className="eyebrow">Lés · 3D</p>
        <p className="eyebrow">Couro caramelo · Placa dourada</p>
      </div>
      {/* Monta já na entrada da página (baixa o código e compila os shaders); só anima quando visível. */}
      <SandalScene active={near} />
      <p className="eyebrow pointer-events-none absolute inset-x-0 bottom-0 text-center">
        Arraste para girar
      </p>
    </div>
  );
}
