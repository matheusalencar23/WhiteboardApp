import {
  elementContainsPoint,
  getElementBounds,
} from "../lib/geometry/elementOperations";
import type { Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";

export function useSelectioMode() {
  const {
    elements,
    setSelectedElementIds,
    addElementId,
    selectionBox,
    setSelectionBox,
  } = useCanvasStore();

  function startSelection(worldPoint: Point, shiftKey = false) {
    let clickedId: string | null = null;
    for (let i = elements.length - 1; i >= 0; i--) {
      if (elementContainsPoint(elements[i], worldPoint)) {
        clickedId = elements[i].id;
        break;
      }
    }

    if (clickedId) {
      if (shiftKey) {
        addElementId(clickedId);
        return;
      }
      
      setSelectedElementIds([clickedId]);
      return;
    }

    setSelectedElementIds([]);
    setSelectionBox({ start: worldPoint, current: worldPoint });
  }

  function updateSelection(worldPoint: Point) {
    if (!selectionBox) return;

    setSelectionBox({ start: selectionBox.start, current: worldPoint });

    const minX = Math.min(selectionBox.start.x, worldPoint.x);
    const maxX = Math.max(selectionBox.start.x, worldPoint.x);
    const minY = Math.min(selectionBox.start.y, worldPoint.y);
    const maxY = Math.max(selectionBox.start.y, worldPoint.y);

    const insideIds = elements
      .filter((el) => {
        const bounds = getElementBounds(el);
        return (
          bounds.x >= minX &&
          bounds.x <= maxX &&
          bounds.y >= minY &&
          bounds.y <= maxY
        );
      })
      .map((el) => el.id);

    setSelectedElementIds(insideIds);
  }

  function stopSelection() {
    setSelectionBox(null);
  }

  return { startSelection, updateSelection, stopSelection };
}
