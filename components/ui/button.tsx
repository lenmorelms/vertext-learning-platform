import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "tertiary" | "text";
type Size = "md" | "lg";

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  href?: string;
  icon?: ReactNode;
};

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-100 disabled:text-primary-300",
  secondary:
    "border border-primary-300 bg-white text-primary-500 hover:border-primary-400 hover:bg-primary-100/40 disabled:opacity-50",
  tertiary:
    "border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-50",
  text: "text-primary-500 hover:text-primary-600 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  md: "px-3 text-body",
  lg: "px-4 text-body-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    variant === "text" && "px-0",
    className,
  );
  const content = (
    <>
      {children}
      {icon}
    </>
  );

  if (href && !props.disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}
