"use client";

import { useLenis } from "lenis/react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { easeOut } from "./ease";

export function Intro() {
  const lenis = useLenis();
  const count = useMotionValue(0);
  const label = useTransform(count, (value) => Math.round(value).toString().padStart(3, "0"));
  const width = useTransform(count, (value) => `${value}%`);
  const controls = useRef<ReturnType<typeof animate> | null>(null);
  const closing = useRef(false);
  const finished = useRef(false);
  const started = useRef(false);
  const lenisRef = useRef(lenis);
  const [phase, setPhase] = useState<"run" | "exit" | "off">("run");
  lenisRef.current = lenis;

  useEffect(() => {
    if (document.documentElement.dataset.intro === "done") {
      setPhase("off");
      window.dispatchEvent(new Event("les-intro-done"));
      return;
    }

    lenis?.stop();
    if (started.current) return;
    started.current = true;
    controls.current = animate(count, 100, {
      duration: 1.5,
      ease: easeOut,
      onComplete: () => leave(),
    });
  }, [count, lenis]);

  function leave() {
    if (closing.current) return;
    closing.current = true;
    controls.current?.stop();
    // Libera o layout com a splash ainda opaca, para a cortina não subir em cima de um reflow.
    document.documentElement.dataset.intro = "exit";
    requestAnimationFrame(() => {
      lenisRef.current?.resize();
      requestAnimationFrame(() => setPhase("exit"));
    });
  }

  function finish() {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem("les-intro", "1");
    } catch {
      /* sessão indisponível */
    }
    document.documentElement.dataset.intro = "done";
    lenisRef.current?.start();
    window.dispatchEvent(new Event("les-intro-done"));
    setPhase("off");
  }

  if (phase === "off") return null;

  return (
    <div
      className={`intro-layer fixed inset-0 z-[100] flex flex-col bg-surface text-ink${phase === "exit" ? " is-leaving" : ""}`}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget || phase !== "exit") return;
        finish();
      }}
    >
      <div className="flex items-center justify-between px-5 py-6 md:px-8">
        <p className="eyebrow">A coleção</p>
        <button type="button" className="eyebrow text-ink" onClick={leave}>
          Pular
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <p className="flex items-end justify-center" aria-hidden>
          {"Lés".split("").map((letter, index) => (
            <span key={`${letter}-${index}`} className="inline-block overflow-hidden">
              <motion.span
                className="font-script inline-block px-[0.04em] text-[22vw] leading-[0.8] md:text-[12rem]"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: 0.08 * index, ease: easeOut }}
              >
                {letter}
              </motion.span>
            </span>
          ))}
        </p>
        <p className="sr-only">Lés by Sabongi</p>
        <motion.p
          className="eyebrow mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          By Sabongi
        </motion.p>
      </div>
      <div className="px-5 pb-8 md:px-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="eyebrow">Nada por acaso</p>
          <motion.p className="font-mono text-sm tracking-[0.18em]">{label}</motion.p>
        </div>
        <div className="h-px bg-line">
          <motion.div style={{ width }} className="h-px bg-accent" />
        </div>
      </div>
    </div>
  );
}
