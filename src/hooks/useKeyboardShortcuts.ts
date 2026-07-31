import { useEffect } from "react";
import { useCanvasStore } from "../store/useCanvasStore";

export function useKeyboardShortcuts() {
  const { deleteSelectedElements, elements, setSelectedElementIds, setTool } =
    useCanvasStore();

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

      if (event.ctrlKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setSelectedElementIds(elements.map((el) => el.id));
        setTool("selection");
      }

      if (event.key === "Delete") {
        event.preventDefault();
        deleteSelectedElements();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [elements, setTool, setSelectedElementIds, deleteSelectedElements]);
}
