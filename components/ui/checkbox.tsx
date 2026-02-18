import * as React from "react";
import { cn } from "./utils";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  className?: string;
};

export function Checkbox({ checked, onChange, id, className }: Props) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={cn("h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-200", className)}
    />
  );
}
