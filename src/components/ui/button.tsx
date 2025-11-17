"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    PropsWithChildren {
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
}

const baseClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/30 hover:scale-[1.01]",
  secondary:
    "bg-white/10 text-white border border-white/20 backdrop-blur hover:bg-white/20",
  ghost:
    "text-white border border-transparent hover:border-white/30 hover:bg-white/5",
  danger: "bg-red-500/90 text-white hover:bg-red-500",
};

export function Button({
  children,
  className,
  variant = "primary",
  fullWidth,
  loading,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseClass,
        variantClass[variant],
        fullWidth && "w-full",
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}

