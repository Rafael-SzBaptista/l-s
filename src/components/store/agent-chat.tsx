"use client";

import { easeInOut } from "@/components/motion/ease";
import { useLockScroll } from "@/components/motion/use-lock-scroll";
import { formatPrice } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, X } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

/** O agente roda no adk2; o Next repassa /agente para ele (ver next.config.ts). */
const API = "/agente/api/les/mensagem";
const SAUDACAO = "Qual sapato você procura?";
const CHAVE_ID = "les.chat.id";

type Sapato = {
  codigo?: string;
  nome?: string;
  marca?: string;
  cor?: string;
  preco?: number;
  imagem?: string;
  numeros?: string;
};

type Mensagem = {
  de: "voce" | "les";
  texto: string;
  sapatos?: Sapato[];
  erro?: boolean;
};

function lerId() {
  try {
    return sessionStorage.getItem(CHAVE_ID) ?? "";
  } catch {
    return "";
  }
}

function guardarId(id: string) {
  try {
    sessionStorage.setItem(CHAVE_ID, id);
  } catch {
    // aba privada
  }
}

async function lerEventos(resposta: Response, tratar: (nome: string, dados: unknown) => void) {
  const leitor = resposta.body?.getReader();
  if (!leitor) return;
  const decodificador = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await leitor.read();
    if (done) break;
    buffer += decodificador.decode(value, { stream: true });
    let corte = buffer.indexOf("\n\n");
    while (corte >= 0) {
      const bloco = buffer.slice(0, corte);
      buffer = buffer.slice(corte + 2);
      let nome = "message";
      const dados: string[] = [];
      for (const linha of bloco.split("\n")) {
        if (linha.startsWith("event:")) nome = linha.slice(6).trim();
        else if (linha.startsWith("data:")) dados.push(linha.slice(5).trim());
      }
      if (dados.length) tratar(nome, JSON.parse(dados.join("\n")));
      corte = buffer.indexOf("\n\n");
    }
  }
}

function imagemDe(src?: string) {
  if (!src) return "";
  return src.startsWith("/") ? `/agente${src}` : src;
}

/** Negrito com um asterisco de cada lado e links clicáveis, como a Lés escreve. */
function Rico({ texto }: { texto: string }) {
  const partes = texto.split(/(https?:\/\/\S+|\*[^*\n]+\*)/g);
  return (
    <>
      {partes.map((parte, i) => {
        if (/^https?:\/\//.test(parte)) {
          return (
            <a key={i} href={parte} target="_blank" rel="noreferrer" className="break-all text-accent underline underline-offset-4">
              {parte}
            </a>
          );
        }
        if (/^\*[^*\n]+\*$/.test(parte)) return <strong key={i}>{parte.slice(1, -1)}</strong>;
        return <Fragment key={i}>{parte}</Fragment>;
      })}
    </>
  );
}

function Balao({ de, children, erro }: { de: Mensagem["de"]; children: ReactNode; erro?: boolean }) {
  return (
    <div
      className={
        de === "voce"
          ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-4 py-3 text-accent-fg"
          : `mr-auto max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-sm border border-line px-4 py-3 ${erro ? "text-red-300" : ""}`
      }
    >
      {children}
    </div>
  );
}

function Cartoes({ sapatos }: { sapatos: Sapato[] }) {
  return (
    <div data-lenis-prevent className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-1">
      {sapatos.map((s, i) => (
        <div key={s.codigo ?? i} className="w-40 shrink-0 border border-line">
          {s.imagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagemDe(s.imagem)} alt="" className="aspect-square w-full bg-surface object-cover" />
          ) : null}
          <div className="space-y-1 p-3 text-sm">
            <p className="leading-snug">{s.nome}</p>
            {s.preco ? <p className="font-mono text-xs">{formatPrice(s.preco)}</p> : null}
            {s.numeros ? <p className="eyebrow">Nº {s.numeros}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgentChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  useLockScroll(open);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [rascunho, setRascunho] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    campo.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [open, onClose]);

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight });
  }, [mensagens]);

  const mexerNaUltima = (mudar: (m: Mensagem) => Mensagem) => {
    setMensagens((atual) => [...atual.slice(0, -1), mudar(atual[atual.length - 1])]);
  };

  async function enviar(e?: FormEvent) {
    e?.preventDefault();
    const texto = rascunho.trim();
    if (!texto || ocupado) return;
    setRascunho("");
    setOcupado(true);
    setMensagens((atual) => [...atual, { de: "voce", texto }, { de: "les", texto: "" }]);

    try {
      const resposta = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lerId(), texto }),
      });
      if (!resposta.ok) {
        const corpo = (await resposta.json().catch(() => ({}))) as { erro?: string };
        throw new Error(corpo.erro || "A Lés não está disponível agora.");
      }
      // Depois de cada ferramenta, o modelo começa outra fala: vira outro balão.
      let quebra = false;
      await lerEventos(resposta, (nome, dados) => {
        const corpo = dados as { id?: string; texto?: string; estado?: string; sapatos?: Sapato[] };
        if (nome === "conversa" && corpo.id) guardarId(corpo.id);
        if (nome === "texto" && corpo.texto) {
          const separar = quebra;
          quebra = false;
          mexerNaUltima((m) => ({ ...m, texto: m.texto + (separar && m.texto ? "\n\n" : "") + corpo.texto }));
        }
        if (nome === "ferramenta") quebra = true;
        if (nome === "ferramenta" && corpo.estado === "ok" && corpo.sapatos?.length) {
          const sapatos = corpo.sapatos;
          mexerNaUltima((m) => ({ ...m, sapatos: [...(m.sapatos ?? []), ...sapatos] }));
        }
        if (nome === "erro" && corpo.texto) mexerNaUltima((m) => ({ ...m, texto: corpo.texto ?? "", erro: true }));
      });
    } catch (err) {
      const texto = err instanceof Error && err.message !== "Failed to fetch" ? err.message : "A Lés não está disponível agora.";
      mexerNaUltima((m) => ({ ...m, texto, erro: true }));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            aria-label="Fechar conversa"
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Conversa com a Lés"
            className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-raised"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: easeInOut }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <p className="eyebrow text-ink">Conversa · Lés</p>
              <button type="button" aria-label="Fechar" onClick={onClose}>
                <X strokeWidth={1.5} />
              </button>
            </div>

            <div ref={lista} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto px-6 py-6 text-[0.95rem] leading-relaxed">
              <Balao de="les">{SAUDACAO}</Balao>
              {mensagens.map((m, i) => {
                const ultima = i === mensagens.length - 1;
                if (m.de === "voce") {
                  return (
                    <Balao key={i} de="voce">
                      {m.texto}
                    </Balao>
                  );
                }
                const blocos = m.texto.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
                return (
                  <Fragment key={i}>
                    {m.sapatos?.length ? <Cartoes sapatos={m.sapatos} /> : null}
                    {blocos.map((b, j) => (
                      <Balao key={j} de="les" erro={m.erro}>
                        <Rico texto={b} />
                      </Balao>
                    ))}
                    {ultima && ocupado && blocos.length === 0 ? (
                      <Balao de="les">
                        <span className="inline-flex gap-1" aria-label="Escrevendo">
                          {[0, 1, 2].map((k) => (
                            <motion.span
                              key={k}
                              className="h-1.5 w-1.5 rounded-full bg-muted"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: k * 0.15 }}
                            />
                          ))}
                        </span>
                      </Balao>
                    ) : null}
                  </Fragment>
                );
              })}
            </div>

            <form onSubmit={enviar} className="flex items-end gap-3 border-t border-line px-6 py-5">
              <textarea
                ref={campo}
                rows={1}
                value={rascunho}
                onChange={(e) => setRascunho(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void enviar();
                  }
                }}
                placeholder="Escreva para a Lés"
                aria-label="Mensagem"
                className="max-h-32 flex-1 resize-none bg-transparent py-3 outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                aria-label="Enviar"
                disabled={ocupado || !rascunho.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-fg transition-opacity disabled:opacity-40"
              >
                <ArrowUp strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </form>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
