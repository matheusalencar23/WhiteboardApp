import type { Bounds, CanvasElement, Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import { getHandleAtPoint } from "../lib/geometry/handles";
import {
  calculateGroupResize,
  calculateRotatedResize,
} from "../lib/geometry/resize";
import { useSelectedElements } from "./useSelectedElements";
import { useRef } from "react";
import {
  applyBoundsToElement,
  getElementLocalBounds,
} from "../lib/geometry/elementOperations";

export function useResizeMode() {
  const initialGroupBounds = useRef<Bounds | null>(null);
  const initialElementsSnapshot = useRef<CanvasElement[]>([]);

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
      const oldBounds = getElementLocalBounds(el);
      const newBounds = calculateRotatedResize(
        oldBounds,
        el.angle,
        activeHandle,
        worldPoint,
      );
      const updatedEl = applyBoundsToElement(el, oldBounds, newBounds);
      updateElement(el.id, updatedEl);
      return;
    }

    const resizedElements = calculateGroupResize(
      snapshot,
      groupBounds,
      activeHandle,
      worldPoint,
    );

    resizedElements.forEach(({ id, x, y, width, height }) => {
      const resizedEl = snapshot.find((e) => e.id === id)!;
      const oldBounds = getElementLocalBounds(resizedEl);
      const newBounds = { x, y, width, height };
      const updatedEl = applyBoundsToElement(resizedEl, oldBounds, newBounds);
      updateElement(id, updatedEl);
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
