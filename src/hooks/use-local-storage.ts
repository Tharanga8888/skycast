"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // other tabs/popups
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function useLocalStorage(key: string, fallback: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key) ?? fallback, // client snapshot
    () => fallback // server / pre-render snapshot
  );

  const setValue = useCallback(
    (next: string) => {
      localStorage.setItem(key, next);
      listeners.forEach((listener) => listener());
    },
    [key]
  );

  return [value, setValue] as const;
}