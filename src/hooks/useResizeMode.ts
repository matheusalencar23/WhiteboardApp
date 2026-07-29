import type { Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import {
  calculateAxisAlignedResizeBounds,
  getHandleAtPoint,
} from "../lib/geometry/handles";
import { calculateRotatedResize } from "../lib/geometry/resize";
import { useSelectedElements } from "./useSelectedElements";

export function useResizeMode() {
  const {
    updateElement,
    zoom,
    setCursor,
    clearCursor,
    activeHandle,
    setActiveHandle,
    initialGroupBounds,
    setInitialGroupBounds,
    initialElementsSnapshot,
    setInitialElementsSnapshot,
  } = useCanvasStore();

  const { selected, angle, bounds } = useSelectedElements();

  function tryStartResize(worldPoint: Point): boolean {
    if (selected.length === 0 || !bounds) return false;

    const handle = getHandleAtPoint(worldPoint, bounds, zoom, angle);
    if (!handle || handle === "rotation") return false;

    setCursor("grabbing");
    setActiveHandle(handle);
    setInitialGroupBounds(bounds);
    setInitialElementsSnapshot([...selected]);
    return true;
  }

  function updateHoverCursor(worldPoint: Point) {
    if (activeHandle || selected.length === 0 || !bounds) return;

    const handle = getHandleAtPoint(worldPoint, bounds, zoom, angle);

    if (handle) {
      setCursor("grab");
      return;
    }

    clearCursor();
  }

  function applyResize(worldPoint: Point) {
    if (
      !activeHandle ||
      !initialGroupBounds ||
      initialElementsSnapshot.length === 0
    ) {
      return;
    }

    if (initialElementsSnapshot.length === 1) {
      const el = initialElementsSnapshot[0];
      const newBounds = calculateRotatedResize(el, activeHandle, worldPoint);
      const updatedEl = el.clone({ ...newBounds });
      updateElement(el.id, updatedEl);
      return;
    }

    const newGroupBounds = calculateAxisAlignedResizeBounds(
      initialGroupBounds,
      activeHandle,
      worldPoint,
    );

    const scaleX = newGroupBounds.width / (initialGroupBounds.width || 1);
    const scaleY = newGroupBounds.height / (initialGroupBounds.height || 1);

    initialElementsSnapshot.forEach((el) => {
      const bounds = el.getLocalBounds();

      const relX = bounds.x - initialGroupBounds.x;
      const relY = bounds.y - initialGroupBounds.y;

      const x = newGroupBounds.x + relX * scaleX;
      const y = newGroupBounds.y + relY * scaleY;
      const width = bounds.width * scaleX;
      const height = bounds.height * scaleY;

      const updatedEl = el.clone({ x, y, width, height });
      updateElement(el.id, updatedEl);
    });
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
    applyResize,
    stopResize,
  };
}
