import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "text";

const base =
  "group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full text-[0.95rem] font-medium tracking-tight transition-colors duration-300 ease-[var(--ease-stage)]";

const variants: Record<Variant, string> = {
  primary: "bg-gold px-6 text-on-gold hover:bg-gold-light",
  ghost: "border border-line-strong px-6 text-paper hover:border-gold hover:text-gold-light",
  text: "min-h-11 px-0 text-paper hover:text-gold-light",
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
      className={`${base} ${variants[variant]} ${className}`}
    >
      <span className="relative">{children}</span>
      {icon && (
        <span aria-hidden className="relative inline-flex">
          {icon}
        </span>
      )}
      {external && <span className="sr-only"> (abre em nova aba)</span>}
    </a>
  );
}
