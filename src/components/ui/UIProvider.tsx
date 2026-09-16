"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ConfirmState {
  message: string;
  title?: string;
  confirmLabel?: string;
  danger?: boolean;
  resolve: (value: boolean) => void;
}

interface UIContextValue {
  toast: (message: string, type?: ToastItem["type"]) => void;
  confirm: (
    message: string,
    options?: { title?: string; confirmLabel?: string; danger?: boolean }
  ) => Promise<boolean>;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI doit être utilisé dans un UIProvider");
  return ctx;
}

export default function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const nextId = useRef(0);

  const toast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback(
    (
      message: string,
      options?: { title?: string; confirmLabel?: string; danger?: boolean }
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({ message, resolve, ...options });
      });
    },
    []
  );

  function handleConfirmChoice(value: boolean) {
    confirmState?.resolve(value);
    setConfirmState(null);
  }

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg ${
              t.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : t.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-border bg-surface text-foreground"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-xl">
            {confirmState.title && (
              <h3 className="mb-2 font-semibold text-foreground">{confirmState.title}</h3>
            )}
            <p className="text-sm text-foreground/75">{confirmState.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => handleConfirmChoice(false)}
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-black/5"
              >
                Annuler
              </button>
              <button
                onClick={() => handleConfirmChoice(true)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold text-white ${
                  confirmState.danger ? "bg-red-600 hover:bg-red-700" : "bg-brand hover:bg-brand-dark"
                }`}
              >
                {confirmState.confirmLabel ?? "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}
