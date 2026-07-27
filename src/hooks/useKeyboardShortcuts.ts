import { useEffect } from "react";
import { useCanvasStore } from "../store/useCanvasStore";

export function useKeyboardShortcuts() {
  const deleteSelectedElements = useCanvasStore(
    (state) => state.deleteSelectedElements,
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === "Delete") {
        event.preventDefault();
        deleteSelectedElements();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedElements]);
}
