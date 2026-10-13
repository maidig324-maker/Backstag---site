"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Menu, X } from "lucide-react";
import { contact, hero } from "@/content/site";
import { visibleNavigation } from "@/lib/visibility";
import { Logo } from "@/components/ui/Logo";
import { EASE } from "@/components/ui/motion";

/** Com linkPrefix "/", as âncoras apontam para a home quando o Header é usado fora dela. */
export function Header({ linkPrefix = "" }: { linkPrefix?: string } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu mobile: trava a rolagem, fecha com Esc e mantém o foco dentro do painel.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
      window.removeEventListener("keydown", onKey);
      menuButton.current?.focus();
    };
  }, [open]);

  return (
    <>
      {/* Barra de progresso da navegação */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gold"
        style={{ scaleX: progress }}
      />

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled && !open
            ? "border-b border-line bg-ink/80 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="container-x flex h-16 items-center justify-between md:h-20">
          <a href={linkPrefix ? "/" : "#topo"} className="relative z-[70] -m-2 p-2" aria-label="Backstag — voltar ao início">
            <Logo />
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
              href={linkPrefix + hero.primaryCta.href}
              className="hidden min-h-11 items-center rounded-full border border-gold/50 px-5 text-sm text-gold-light transition-colors hover:bg-gold hover:text-ink md:inline-flex"
            >
              {hero.primaryCta.label}
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
              {open ? <X className="size-6" strokeWidth={1.5} /> : <Menu className="size-6" strokeWidth={1.5} />}
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
            className="fixed inset-0 z-[55] flex flex-col bg-ink px-5 pb-10 pt-24 lg:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <nav aria-label="Menu mobile" className="flex-1">
              <ul className="border-t border-line">
                {visibleNavigation.map((item, i) => (
                  <li key={item.href} className="overflow-hidden border-b border-line">
                    <motion.a
                      href={linkPrefix + item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-5"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: EASE }}
                    >
                      <span className="display text-4xl">{item.label}</span>
                      <span className="cue">0{i + 1}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-col gap-3">
              <a
                href={linkPrefix + hero.primaryCta.href}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold font-medium text-ink"
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
