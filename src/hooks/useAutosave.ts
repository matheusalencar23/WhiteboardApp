import { useEffect, useRef } from "react";
import { useCanvasStore } from "../store/useCanvasStore";
import { saveToLocalStorage } from "../lib/persistence/storage";

const DEBOUNCE_MS = 500;

export function useAutosave() {
  const { elements } = useCanvasStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      saveToLocalStorage(elements);
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [elements]);
}
