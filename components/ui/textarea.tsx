import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[140px] w-full resize-none rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm leading-6 text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] placeholder:text-zinc-500 focus:border-white/10 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
