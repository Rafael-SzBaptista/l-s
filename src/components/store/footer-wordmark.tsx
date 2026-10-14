"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * "LÉS" do rodapé em SVG. Com -webkit-text-stroke o contorno era rasterizado
 * como texto (fino, falhado e com franjas no Windows); aqui é um traço vetorial
 * de espessura fixa, liso em qualquer tamanho.
 */
export function FooterWordmark() {
  const textRef = useRef<SVGTextElement>(null);
  const [box, setBox] = useState("0 0 1000 300");

  useLayoutEffect(() => {
    const fit = () => {
      const text = textRef.current;
      if (!text) return;
      const b = text.getBBox();
      const pad = 4;
      // Corta na linha de base (y = 0): "LÉS" não desce abaixo dela, e a caixa
      // da fonte reservava esse espaço vazio embaixo.
      setBox(`${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${-b.y + pad * 2}`);
    };
    fit();
    // A largura real só existe com a fonte carregada.
    document.fonts?.ready.then(fit);
  }, []);

  return (
    <svg
      aria-hidden
      viewBox={box}
      className="mx-auto mt-8 block h-[clamp(4.5rem,min(26vw,31svh),21rem)] w-auto max-w-full overflow-visible"
    >
      <text
        ref={textRef}
        x="0"
        y="0"
        fill="none"
        stroke="rgba(241,238,232,0.42)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontVariationSettings: '"wdth" 125',
          letterSpacing: "-0.045em",
          fontSize: 200,
        }}
      >
        LÉS
      </text>
    </svg>
  );
}
