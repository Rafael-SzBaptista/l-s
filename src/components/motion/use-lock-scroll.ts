"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";

let locks = 0;

/** Há algum menu/busca segurando a rolagem? */
export function isScrollLocked() {
  return locks > 0;
}

export function useLockScroll(locked: boolean) {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    if (!locked) return;
    lenis?.stop();
  }, [locked, lenis]);

  useEffect(() => {
    if (!locked) return;
    locks += 1;
    if (locks === 1) {
      const y = window.scrollY;
      document.body.dataset.scrollLock = String(y);
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.left = "0";
      document.body.style.width = "100%";
      lenisRef.current?.stop();
    }
    return () => {
      locks -= 1;
      if (locks > 0) return;
      locks = 0;
      const y = Number(document.body.dataset.scrollLock || "0");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.width = "";
      delete document.body.dataset.scrollLock;
      const current = lenisRef.current;
      current?.start();
      if (current) current.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    };
  }, [locked]);
}
