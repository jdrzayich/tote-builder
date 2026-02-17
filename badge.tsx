import * as React from "react";
import { cn } from "./utils";

export function Badge({ className, variant="secondary", ...props }: React.HTMLAttributes<HTMLSpanElement> & {variant?: "secondary"|"outline"}) {
  const v = variant === "outline"
    ? "border border-neutral-200 bg-white text-neutral-800"
    : "bg-neutral-100 text-neutral-800";
  return <span className={cn("inline-flex items-center rounded-xl px-2 py-1 text-xs font-medium", v, className)} {...props} />;
}
