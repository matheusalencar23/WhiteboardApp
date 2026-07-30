import type { Bounds, IElement, Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import { getHandleAtPoint } from "../lib/geometry/handles";
import {
  calculateGroupResize,
  calculateRotatedResize,
} from "../lib/geometry/resize";
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
    setCursor(handle ? "grab" : "default");
    if (!handle) clearCursor();
  }

  function applyResize(worldPoint: Point) {
    const groupBounds = initialGroupBounds.current;
    const snapshot = initialElementsSnapshot.current;

    if (!activeHandle || !groupBounds || snapshot.length === 0) {
      return;
    }

    if (snapshot.length === 1) {
      const el = snapshot[0];
      const newBounds = calculateRotatedResize(el, activeHandle, worldPoint);
      const updatedEl = el.clone({ ...newBounds });
      updateElement(el.id, updatedEl);
      return;
    }

    const resizedElements = calculateGroupResize(
      snapshot,
      groupBounds,
      activeHandle,
      worldPoint,
    );

    resizedElements.forEach((el) => {
      const resizedEl = snapshot.find((e) => e.id === el.id)!;
      const updatedEl = resizedEl.clone({ ...el });
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
