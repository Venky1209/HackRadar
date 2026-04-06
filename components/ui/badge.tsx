import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", {
  variants: {
    variant: {
      default: "border-slate-700 bg-slate-800/80 text-slate-100",
      outline: "border-slate-700 bg-transparent text-slate-300",
      success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
      warning: "border-amber-500/20 bg-amber-500/10 text-amber-100",
      danger: "border-rose-500/20 bg-rose-500/10 text-rose-100",
      violet: "border-slate-600/80 bg-slate-800/80 text-slate-100",
      muted: "border-slate-700 bg-slate-900/60 text-slate-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
