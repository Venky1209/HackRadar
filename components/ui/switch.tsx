import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}

function Switch({ checked, onCheckedChange, className, disabled, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex h-8 w-14 items-center rounded-full border p-1 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        checked
          ? "border-slate-300/90 bg-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.2)]"
          : "border-slate-700/90 bg-slate-900/85 shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)]",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "h-6 w-6 rounded-full transition-all duration-200 ease-out",
          checked
            ? "translate-x-6 bg-slate-950 shadow-[0_8px_24px_rgba(15,23,42,0.35)]"
            : "translate-x-0 bg-slate-200 shadow-[0_4px_14px_rgba(0,0,0,0.32)]",
        )}
      />
    </button>
  );
}

export { Switch };
