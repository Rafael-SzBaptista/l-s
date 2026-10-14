import { SplitText } from "@/components/motion/reveal";
import { buttonFill } from "@/lib/ui";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-5 py-36 md:px-10">
      <p className="eyebrow">404</p>
      <SplitText
        as="h1"
        text="Esse passo não existe."
        className="font-wide mt-4 text-[clamp(3rem,8vw,6.5rem)]"
      />
      <Link href="/colecao" className={`${buttonFill} mt-10`}>
        Voltar à coleção
      </Link>
    </div>
  );
}
