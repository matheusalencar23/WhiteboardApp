import type { Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import {
  calculateResizeBounds,
  getGroupBounds,
  getHandleAtPoint,
} from "../lib/geometry/utils";
import { ElementFactory } from "../lib/geometry/elementFactory";

export function useResizeMode() {
  // const initialGroupBounds = useRef<Bounds | null>(null);
  // const initialElementsSnapshot = useRef<IElement[]>([]);

  const {
    elements,
    updateElement,
    zoom,
    selectedElementIds,
    setCursor,
    clearCursor,
    activeHandle,
    setActiveHandle,
    initialGroupBounds,
    setInitialGroupBounds,
    initialElementsSnapshot,
    setInitialElementsSnapshot
  } = useCanvasStore();

  function selectedElements() {
    return elements.filter((el) => selectedElementIds.includes(el.id));
  }

  function tryStartResize(worldPoint: Point): boolean {
    if (selectedElements().length === 0) return false;

    const bounds = getGroupBounds(selectedElements());
    if (!bounds) return false;

    const handle = getHandleAtPoint(worldPoint, bounds, zoom);
    if (!handle || handle === "rotation") return false;

    setCursor("grabbing");
    setActiveHandle(handle);
    setInitialGroupBounds(bounds);
    setInitialElementsSnapshot([...selectedElements()]);
    return true;
  }

  function updateHoverCursor(worldPoint: Point) {
    if (activeHandle || selectedElements().length === 0) return;

    const bounds = getGroupBounds(selectedElements());
    if (!bounds) return;

    const handle = getHandleAtPoint(worldPoint, bounds, zoom);
    if (handle) {
      setCursor("grab");
    } else {
      clearCursor();
    }
  }

  function resize(worldPoint: Point): boolean {
    if (
      !activeHandle ||
      !initialGroupBounds ||
      initialElementsSnapshot.length === 0
    ) {
      return false;
    }

    const newGroupBounds = calculateResizeBounds(
      initialGroupBounds,
      activeHandle,
      worldPoint,
    );

    const initialWidth = initialGroupBounds.width || 1;
    const initialHeight = initialGroupBounds.height || 1;

    initialElementsSnapshot.forEach((selectedEl) => {
      const bounds = selectedEl.getBounds();

      const relX = (bounds.x - initialGroupBounds!.x) / initialWidth;
      const relY = (bounds.y - initialGroupBounds!.y) / initialHeight;
      const relWidth = bounds.width / initialWidth;
      const relHeight = bounds.height / initialHeight;

      const newX = newGroupBounds.x + relX * newGroupBounds.width;
      const newY = newGroupBounds.y + relY * newGroupBounds.height;
      const newW = relWidth * newGroupBounds.width;
      const newH = relHeight * newGroupBounds.height;

      const id = selectedEl.id;
      const el = ElementFactory.create(
        selectedEl.type!,
        newX,
        newY,
        newW,
        newH,
        { ...selectedEl.properties },
      );

      updateElement(id, el);
    });

    return true;
  }

  function stopResize() {
    setActiveHandle(null);
    setInitialGroupBounds(null);
    setInitialElementsSnapshot([]);
  }

  function isResizing() {
    return !!activeHandle && activeHandle !== "rotation";
  }

  return {
    isResizing,
    tryStartResize,
    updateHoverCursor,
    updateResize: resize,
    stopResize,
  };
}
