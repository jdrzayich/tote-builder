import * as React from "react";

type Toast = { id: string; title: string; description?: string };

const ToastContext = React.createContext<{
  push: (t: Omit<Toast, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  function push(t: Omit<Toast, "id">) {
    const id = Math.random().toString(16).slice(2, 10);
    const toast: Toast = { id, ...t };
    setToasts((prev) => [toast, ...prev].slice(0, 3));
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3200);
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="w-72 rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg">
            <div className="text-sm font-semibold">{t.title}</div>
            {t.description ? <div className="mt-1 text-xs text-neutral-600">{t.description}</div> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
