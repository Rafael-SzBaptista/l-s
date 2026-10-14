// Cada cópia tem 0.25em de folga em cima e embaixo, e a margem negativa devolve
// essa altura ao layout. Sem a folga, o til e a cedilha (COLEÇÃO) saíam da caixa
// de 1em: o til da cópia escondida espiava na borda e piscava com o subpixel.
const copy =
  "col-start-1 row-start-1 py-[0.25em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

export function RollText({ children }: { children: string }) {
  return (
    <span className="-my-[0.25em] inline-grid overflow-hidden leading-none">
      <span className={`${copy} group-hover:-translate-y-full`}>{children}</span>
      <span aria-hidden className={`${copy} translate-y-full group-hover:translate-y-0`}>
        {children}
      </span>
    </span>
  );
}
