"use client";

import { RollText } from "@/components/motion/roll-text";
import { easeInOut, easeOut } from "@/components/motion/ease";
import { useLockScroll } from "@/components/motion/use-lock-scroll";
import { products } from "@/lib/products";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBag } from "./bag";
import { Logo } from "./logo";

const links = [
  { href: "/colecao", label: "Coleção" },
  { href: "/sobre", label: "A marca" },
];

export function SiteTop() {
  const pathname = usePathname();
  const bag = useBag();
  const ref = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const overlay = pathname === "/";

  useLockScroll(menu || search);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let last = window.scrollY;

    // Só troca de estado após um deslocamento acumulado na mesma direção:
    // o fim da rolagem suave gera oscilações de poucos px que faziam a barra piscar.
    let travel = 0;
    let hidden = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - last;
      last = y;
      el.dataset.scrolled = y > 24 ? "true" : "false";

      if (menu || search || y <= 240) {
        hidden = false;
        travel = 0;
      } else if (delta !== 0) {
        travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
        if (travel > 12) hidden = true;
        else if (travel < -40) hidden = false;
      }
      el.dataset.hidden = hidden ? "true" : "false";
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [menu, search]);

  return (
    <>
      <div
        ref={ref}
        className="site-top"
        data-overlay={overlay ? "true" : "false"}
        data-scrolled="false"
        data-hidden="false"
      >
        <div className="announce overflow-hidden border-b border-line">
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <p key={copy} className="eyebrow px-4 py-3 whitespace-nowrap text-ink/80">
                A coleção está na loja — Nada por acaso — Conforto e modernidade —{" "}
              </p>
            ))}
          </div>
        </div>
        <header
          className="site-header"
          style={{ viewTransitionName: "site-header" }}
        >
          <div className="relative flex h-[var(--header-h)] items-center justify-between px-5 md:px-8">
            <button
              type="button"
              className="relative z-10 lg:hidden"
              aria-label={menu ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menu}
              onClick={() => setMenu((open) => !open)}
            >
              {menu ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
            </button>
            <Link
              href="/"
              aria-label="Lés by Sabongi, início"
              className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
              data-cursor="Abrir"
            >
              <Logo />
            </Link>
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-cursor="Abrir"
                  className="group font-mono text-[0.68rem] uppercase tracking-[0.2em]"
                >
                  <RollText>{link.label}</RollText>
                </Link>
              ))}
            </nav>
            <div className="relative z-10 flex items-center gap-4">
              <button
                type="button"
                aria-label="Buscar"
                onClick={() => setSearch(true)}
              >
                <Search strokeWidth={1.5} className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em]"
                aria-label="Abrir sacola"
                onClick={() => bag.setOpen(true)}
              >
                <ShoppingBag strokeWidth={1.5} className="h-5 w-5" />
                <span className="relative inline-grid h-4 overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {bag.count > 0 ? (
                      <motion.span
                        key={bag.count}
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                      >
                        {bag.count}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
              </button>
            </div>
          </div>
        </header>
      </div>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
      <SearchPanel open={search} onClose={() => setSearch(false)} />
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[80] flex flex-col bg-raised px-6 py-6 lg:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: easeInOut }}
        >
          <div className="flex items-center justify-between">
            <Logo />
            <button type="button" aria-label="Fechar menu" onClick={onClose}>
              <X strokeWidth={1.5} />
            </button>
          </div>
          <nav className="mt-16 flex flex-col gap-4" data-lenis-prevent>
            {links.map((link, index) => (
              <div key={link.href} className="overflow-hidden">
                <motion.div
                  initial={{ y: "118%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.8, delay: 0.12 + index * 0.06, ease: easeOut }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="font-wide block text-[clamp(3rem,14vw,5rem)]"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              </div>
            ))}
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  const results = products.filter((product) => {
    if (!normalized) return true;
    return `${product.name} ${product.category} ${product.summary}`
      .toLocaleLowerCase("pt-BR")
      .includes(normalized);
  });

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Busca"
          className="fixed inset-0 z-[80] flex flex-col bg-surface px-5 py-6 md:px-10"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: easeInOut }}
        >
          <div className="flex items-center justify-between">
            <p className="eyebrow text-ink">Busca</p>
            <button type="button" aria-label="Fechar busca" onClick={onClose}>
              <X strokeWidth={1.5} />
            </button>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="O que você procura"
            className="font-wide mt-10 w-full bg-transparent text-[clamp(2.4rem,7vw,5.5rem)] outline-none placeholder:text-ink/20"
          />
          <ul data-lenis-prevent className="mt-10 flex-1 overflow-y-auto border-t border-line">
            {results.map((product) => (
              <li key={product.slug} className="border-b border-line">
                <Link
                  href={`/produto/${product.slug}`}
                  onClick={onClose}
                  className="group flex items-baseline justify-between gap-6 py-5"
                >
                  <span className="link-line text-lg">{product.name}</span>
                  <span className="eyebrow">{product.category}</span>
                </Link>
              </li>
            ))}
            {results.length === 0 ? (
              <li className="py-10 text-muted">Nenhuma peça com esse nome.</li>
            ) : null}
          </ul>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
