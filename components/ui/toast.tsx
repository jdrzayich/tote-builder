"use client";

import * as React from "react";
import { cn } from "./utils";

export type ToastVariant = "default" | "destructive";

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type ToastContextValue = {
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  toasts: Toast[];
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: Omit<Toast, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const next: Toast = {
        id,
        variant: "default",
        duration: 3500,
        ...t,
      };
      setToasts((prev) => [...prev, next]);

      const duration = next.duration ?? 3500;
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider />");
  }
  return ctx;
}

export function Toaster() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {ctx.toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-xl border bg-white p-4 shadow-lg",
            "animate-in fade-in slide-in-from-bottom-2",
            t.variant === "destructive" ? "border-red-300" : "border-slate-200"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {t.title ? (
                <div className="text-sm font-semibold text-slate-900">
                  {t.title}
                </div>
              ) : null}
              {t.description ? (
                <div className="mt-1 text-sm text-slate-600">{t.description}</div>
              ) : null}
            </div>
            <button
              onClick={() => ctx.dismiss(t.id)}
              className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
