import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="container-x flex min-h-[100svh] flex-col justify-center py-24">
      <Logo />
      <p className="cue mt-16">Erro 404</p>
      <h1 className="display mt-6 text-5xl md:text-7xl">
        Esta página ficou <span className="accent">nos bastidores.</span>
      </h1>
      <Link href="/" className="mt-12 inline-flex min-h-12 items-center self-start rounded-full bg-gold px-6 font-medium text-ink hover:bg-gold-light">
        Voltar para o início
      </Link>
    </main>
  );
}
