"use client";

import dynamic from "next/dynamic";

const SandalScene = dynamic(() => import("./sandal-scene"), {
  ssr: false,
  loading: () => null,
});

export function SandalShowcase() {
  return (
    <div className="relative h-[78svh] min-h-[28rem]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between">
        <p className="eyebrow">Lés · 3D</p>
        <p className="eyebrow">Tiras · Tachas douradas</p>
      </div>
      <SandalScene />
      <p className="eyebrow pointer-events-none absolute inset-x-0 bottom-0 text-center">
        Arraste para girar
      </p>
    </div>
  );
}
