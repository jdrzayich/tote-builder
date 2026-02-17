import * as React from "react";
import { cn } from "./utils";

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={cn("text-sm font-medium text-neutral-700", props.className)}
    />
  );
}
