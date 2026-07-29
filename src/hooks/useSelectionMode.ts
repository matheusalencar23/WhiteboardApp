import type { Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";

export function useSelectionMode() {
  const {
    elements: allElements,
    setSelectedElementIds,
    selectionBox,
    setSelectionBox,
  } = useCanvasStore();

  function startSelection(worldPoint: Point) {
    let clickedElementId: string | null = null;

    for (let i = allElements.length - 1; i >= 0; i--) {
      if (allElements[i].containsPoint({ x: worldPoint.x, y: worldPoint.y })) {
        clickedElementId = allElements[i].id;
        break;
      }
    }

    if (clickedElementId) {
      setSelectedElementIds([clickedElementId]);
    } else {
      setSelectedElementIds([]);
      setSelectionBox({ start: worldPoint, current: worldPoint });
    }
  }

  function updateSelection(worldPoint: Point) {
    if (!selectionBox) return;

    const { start, current } = selectionBox!;
    if (!start || !current) return;

    setSelectionBox({ start, current: worldPoint });
    const minX = Math.min(start.x, current.x);
    const maxX = Math.max(start.x, current.x);
    const minY = Math.min(start.y, current.y);
    const maxY = Math.max(start.y, current.y);

    const elementsInsideIds = allElements
      .filter((el) => {
        const { x, y, width, height } = el.getBounds();

        return (
          x >= minX && x + width <= maxX && y >= minY && y + height <= maxY
        );
      })
      .map((el) => el.id);

    setSelectedElementIds(elementsInsideIds);

    return;
  }

  return { startSelection, updateSelection };
}
