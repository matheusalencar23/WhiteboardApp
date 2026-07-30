import type { Bounds, IElement, Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import {
  calculateAxisAlignedResizeBounds,
  getHandleAtPoint,
} from "../lib/geometry/handles";
import { calculateRotatedResize } from "../lib/geometry/resize";
import { useSelectedElements } from "./useSelectedElements";
import { useRef } from "react";

export function useResizeMode() {
  const initialGroupBounds = useRef<Bounds | null>(null);
  const initialElementsSnapshot = useRef<IElement[]>([]);

  const {
    updateElement,
    zoom,
    setCursor,
    clearCursor,
    activeHandle,
    setActiveHandle,
  } = useCanvasStore();

  const { selected, angle, bounds } = useSelectedElements();

  function tryStartResize(worldPoint: Point): boolean {
    if (selected.length === 0 || !bounds) return false;

    const handle = getHandleAtPoint(worldPoint, bounds, zoom, angle);
    if (!handle || handle === "rotation") return false;

    setCursor("grabbing");
    setActiveHandle(handle);
    initialGroupBounds.current = bounds;
    initialElementsSnapshot.current = [...selected];
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
      !initialGroupBounds.current ||
      initialElementsSnapshot.current.length === 0
    ) {
      return;
    }

    if (initialElementsSnapshot.current.length === 1) {
      const el = initialElementsSnapshot.current[0];
      const newBounds = calculateRotatedResize(el, activeHandle, worldPoint);
      const updatedEl = el.clone({ ...newBounds });
      updateElement(el.id, updatedEl);
      return;
    }

    const newGroupBounds = calculateAxisAlignedResizeBounds(
      initialGroupBounds.current,
      activeHandle,
      worldPoint,
    );

    const scaleX =
      newGroupBounds.width / (initialGroupBounds.current.width || 1);
    const scaleY =
      newGroupBounds.height / (initialGroupBounds.current.height || 1);

    initialElementsSnapshot.current.forEach((el) => {
      const bounds = el.getLocalBounds();

      const relX = bounds.x - initialGroupBounds.current!.x;
      const relY = bounds.y - initialGroupBounds.current!.y;

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
    initialGroupBounds.current = null;
    initialElementsSnapshot.current = [];
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
