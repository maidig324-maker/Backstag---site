"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { MessageCircle } from "lucide-react";
import { primaryContact } from "@/lib/contact";
import { contact, hero } from "@/content/site";
import { visibleNavigation } from "@/lib/visibility";
import { Logo } from "@/components/ui/Logo";
import { EASE } from "@/components/ui/motion";

/** Com linkPrefix "/", as âncoras apontam para a home quando o Header é usado fora dela. */
export function Header({ linkPrefix = "" }: { linkPrefix?: string } = {}) {
  const main = primaryContact();
  const [scrolled, setScrolled] = useState(false);
  // fundo sob o cabeçalho: claro (branco/amarelo) ou escuro — o cabeçalho acompanha
  const [surface, setSurface] = useState<"light" | "dark">("dark");
  const [surfaceRgb, setSurfaceRgb] = useState("9 9 11");
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
      // a seção que está logo abaixo do cabeçalho decide o tom
      const hit = document.elementsFromPoint(window.innerWidth / 2, 34).find((el) => !el.closest("#site-header") && el.closest("[data-surface]"));
      const host = hit?.closest<HTMLElement>("[data-surface]");
      const tone = host?.dataset.surface === "light" ? "light" : "dark";
      const rgb = host?.dataset.rgb ?? "9 9 11";
      setSurface((v) => (v === tone ? v : tone));
      setSurfaceRgb((v) => (v === rgb ? v : rgb));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  const light = open || surface === "light";

  // Menu mobile: trava a rolagem, fecha com Esc e mantém o foco dentro do painel.
  useEffect(() => {
    if (!open) return;
    // iOS: travar html e body, senão a página rola por trás do menu
    const prev = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const first = panel.current?.querySelector<HTMLElement>("a,button");
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        const items = panel.current.querySelectorAll<HTMLElement>("a,button");
        const a = items[0];
        const b = items[items.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKey);
      menuButton.current?.focus();
    };
  }, [open]);

  return (
    <>
      {/* Barra de progresso da navegação */}
      <motion.div
        aria-hidden
        className="op-progress fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gold"
        style={{ scaleX: progress }}
      />

      <header
        id="site-header"
        data-surface={light ? "light" : "dark"}
        style={{ ["--hbg" as string]: surfaceRgb }}
        className={`${light ? "tone-day tone-white" : ""} fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 lg:!border-transparent lg:!bg-transparent lg:!backdrop-blur-none ${
          scrolled && !open
            ? "bg-[linear-gradient(180deg,rgb(var(--hbg))_35%,rgb(var(--hbg)/0.8)_70%,rgb(var(--hbg)/0))] pb-3 lg:!bg-none lg:pb-0"
            : ""
        }`}
      >
        {/* no computador: menu flutuante em pílula de vidro */}
        <div
          className={`container-x flex h-16 items-center justify-between transition-[background-color,box-shadow,margin] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] md:h-20 lg:mx-auto lg:h-16 lg:w-[min(72rem,calc(100%-3rem))] lg:rounded-full lg:!pl-5 lg:!pr-2 ${
            scrolled
              ? light
                ? "lg:mt-4 lg:bg-[rgb(255_255_255/0.78)] lg:shadow-[0_0_0_1px_rgb(20_20_20/0.06),0_20px_50px_-24px_rgb(20_20_20/0.35)] lg:backdrop-blur-xl"
                : "lg:mt-4 lg:bg-[rgb(12_12_14/0.72)] lg:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_20px_50px_-20px_rgb(0_0_0/0.6)] lg:backdrop-blur-xl"
              : "lg:mt-6"
          }`}
        >
          <a href={linkPrefix ? "/" : "#topo"} className="relative z-[70] -m-2 p-2 lg:ml-1" aria-label="Backstag — voltar ao início">
            <Logo priority />
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {visibleNavigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={linkPrefix + item.href}
                    className="group relative py-2 text-sm text-paper/75 transition-colors hover:text-paper"
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-500 ease-[var(--ease-stage)] group-hover:scale-x-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={main.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-11 items-center gap-2 rounded-full border border-gold/50 px-5 text-sm text-gold-light transition-colors hover:bg-gold hover:text-on-gold md:inline-flex"
            >
              <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden />
              {main.channel === "whatsapp" ? "WhatsApp" : hero.primaryCta.label}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="relative z-[70] -mr-2 inline-flex size-12 items-center justify-center text-paper lg:hidden"
            >
              {/* duas linhas que giram e viram um X */}
              <span aria-hidden className="relative block h-3 w-6">
                <span className={`absolute left-0 h-px w-6 bg-current transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-6 bg-current transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-surface="light"
            className="tone-day tone-white fixed inset-0 z-40 flex flex-col overscroll-contain bg-ink/95 px-5 pb-10 pt-24 backdrop-blur-2xl lg:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <nav aria-label="Menu mobile" className="flex-1">
              <ul>
                {visibleNavigation.map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.a
                      href={linkPrefix + item.href}
                      onClick={() => setOpen(false)}
                      className="flex py-4"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: EASE }}
                    >
                      <span className="display text-4xl">{item.label}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-col gap-3">
              <a
                href={main.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold font-medium text-ink"
              >
                <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden />
                {main.channel === "whatsapp" ? "Conversar pelo WhatsApp" : hero.primaryCta.label}
              </a>
              <a
                href={linkPrefix + hero.primaryCta.href}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong text-sm text-paper"
              >
                {hero.primaryCta.label}
              </a>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center text-sm text-mute"
              >
                Instagram {contact.instagramHandle}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
