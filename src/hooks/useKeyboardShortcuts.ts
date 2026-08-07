import { useEffect, useRef } from "react";
import { useCanvasStore } from "../store/useCanvasStore";
import { type CanvasElement } from "../lib/geometry/types";
import { duplicateElement } from "../lib/geometry/createElement";

const PASTE_STEP = 20;

export function useKeyboardShortcuts() {
  const clipboard = useRef<CanvasElement[]>([]);
  const pasteCount = useRef(0);

  const {
    elements,
    selectedElementIds,
    addElements,
    deleteSelectedElements,
    setSelectedElementIds,
    setTool,
  } = useCanvasStore();

  function isTextEditor(element: HTMLElement) {
    return (
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.isContentEditable
    );
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;

      if (isTextEditor(target)) return;

      const isModifier = event.ctrlKey || event.metaKey; // metaKey cobre Cmd no macOS

      if (event.key === "Delete") {
        event.preventDefault();
        deleteSelectedElements();
      }

      if (isModifier && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setSelectedElementIds(elements.map((el) => el.id));
        setTool("selection");
      }

      if (isModifier && event.key.toLowerCase() === "c") {
        event.preventDefault();
        const selected = elements.filter((el) =>
          selectedElementIds.includes(el.id),
        );
        if (selected.length === 0) return;

        clipboard.current = selected;
        pasteCount.current = 0;
        return;
      }

      if (isModifier && event.key.toLowerCase() === "v") {
        event.preventDefault();
        if (clipboard.current.length === 0) return;

        pasteCount.current += 1;
        const offset = {
          x: PASTE_STEP * pasteCount.current,
          y: PASTE_STEP * pasteCount.current,
        };
        const pasted = clipboard.current.map((el) =>
          duplicateElement(el, offset),
        );
        addElements(pasted);
        setSelectedElementIds(pasted.map((el) => el.id));
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    elements,
    selectedElementIds,
    addElements,
    deleteSelectedElements,
    setSelectedElementIds,
    setTool,
  ]);
}
