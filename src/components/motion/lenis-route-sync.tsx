"use client";

import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { isScrollLocked } from "./use-lock-scroll";

// Tempo em que a rolagem fica pausada depois de trocar de página.
const SETTLE_MS = 700;

export function LenisRouteSync() {
  const pathname = usePathname();
  const lenis = useLenis();
  const lastPath = useRef(pathname);

  // Layout effect: volta ao topo no mesmo commit da rota nova, antes da view
  // transition fotografar a página. Com useEffect a página nova aparecia na
  // rolagem da anterior e, se fosse mais curta, mostrava direto o rodapé.
  //
  // A Lenis fica pausada por um instante: clicando no meio de uma rolagem, a
  // inércia da roda/trackpad continuava chegando e descia a página nova de novo.
  // Só em troca de rota: na primeira carga quem segura a rolagem é a intro.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });
    if (lastPath.current === pathname || !lenis) return;
    lastPath.current = pathname;
    lenis.stop();
    const id = window.setTimeout(() => {
      if (!isScrollLocked()) lenis.start();
    }, SETTLE_MS);
    return () => {
      window.clearTimeout(id);
      if (!isScrollLocked()) lenis.start();
    };
  }, [pathname, lenis]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
