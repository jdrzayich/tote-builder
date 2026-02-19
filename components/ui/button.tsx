import * as React from "react";
import { cn } from "./utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({ className, variant="primary", size="md", ...props }: Props) {
  const v =
    variant === "primary"
      ? "bg-ryg-orange text-white hover:opacity-90"
      : variant === "outline"
      ? "border border-neutral-200 bg-white hover:bg-neutral-50"
      : "bg-transparent hover:bg-neutral-100";
  const s =
    size === "sm"
      ? "h-9 px-3 text-sm"
      : size === "lg"
      ? "h-12 px-4 text-base"
      : size === "icon"
      ? "h-10 w-10 p-0"
      : "h-10 px-4 text-sm";
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
        v,
        s,
        className
      )}
      {...props}
    />
  );
}
