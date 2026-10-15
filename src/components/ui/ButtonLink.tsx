import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "text";

// Movimento com "massa": curva de mola suave em tudo que reage ao toque
const base =
  "group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full text-[0.95rem] font-medium tracking-tight transition-[background-color,color,border-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-gold pl-6 pr-6 text-on-gold hover:bg-gold-light",
  ghost: "border border-line-strong px-6 text-paper hover:border-gold hover:text-gold-light",
  text: "min-h-11 px-0 text-paper hover:text-gold-light",
};

// Ícone dentro do próprio círculo, encostado na borda direita do botão
const iconWrap: Record<Variant, string> = {
  primary: "bg-[color-mix(in_oklab,var(--color-on-gold)_12%,transparent)]",
  ghost: "bg-[color-mix(in_oklab,var(--color-paper)_8%,transparent)]",
  text: "",
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
  icon,
  className = "",
  ariaLabel,
}: Props) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} ${variants[variant]} ${icon && variant !== "text" ? "!pr-1.5" : ""} ${className}`}
    >
      <span className="relative">{children}</span>
      {icon && (
        <span
          aria-hidden
          className={`relative inline-flex size-9 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105 ${iconWrap[variant]}`}
        >
          {icon}
        </span>
      )}
      {external && <span className="sr-only"> (abre em nova aba)</span>}
    </a>
  );
}
