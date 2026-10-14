import { FooterWordmark } from "./footer-wordmark";
import { Logo } from "./logo";
import Link from "next/link";

const links = [
  { href: "/colecao", label: "Coleção" },
  { href: "/sobre", label: "A marca" },
];

// Contatos FICTÍCIOS de exemplo: trocar pelos dados reais da loja antes de publicar.
const contacts = [
  {
    label: "E-mail",
    value: "contato@lesbysabongi.com.br",
    href: "mailto:contato@lesbysabongi.com.br",
  },
  {
    label: "Telefone",
    value: "(11) 3456-7890",
    href: "tel:+551134567890",
    note: "Seg. a sáb., 10h às 19h",
  },
  {
    label: "Loja",
    value: "Rua Haddock Lobo, 1234 — Jardins",
    note: "São Paulo, SP · 01414-000",
  },
];

export function Footer() {
  return (
    // Sem viewTransitionName: o rodapé fica por baixo do conteúdo, e como camada
    // própria da transição ele seria pintado por cima da página nova.
    <footer className="overflow-hidden bg-raised px-5 pt-16 pb-6 md:px-10">
      <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
        <Logo size="lg" />
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-8 gap-y-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="link-line eyebrow text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <address className="mt-10 flex flex-col items-start gap-4 border-t border-line pt-8 not-italic">
        {contacts.map((item) => (
          <div key={item.label}>
            <p className="eyebrow">{item.label}</p>
            {item.href ? (
              <a href={item.href} className="link-line mt-3 inline-block text-ink">
                {item.value}
              </a>
            ) : (
              <p className="mt-3 text-ink">{item.value}</p>
            )}
            {item.note ? <p className="mt-1 text-sm text-muted">{item.note}</p> : null}
          </div>
        ))}
      </address>
      <FooterWordmark />
    </footer>
  );
}
