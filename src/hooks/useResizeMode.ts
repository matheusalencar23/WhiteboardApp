import { useRef } from "react";
import type {
  Bounds,
  HandleType,
  IElement,
  Point,
} from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import {
  calculateResizeBounds,
  getGroupBounds,
  getHandleAtPoint,
} from "../lib/geometry/utils";
import { ElementFactory } from "../lib/geometry/elementFactory";

export function useResizeMode() {
  const activeHandle = useRef<HandleType | null>(null);
  const initialGroupBounds = useRef<Bounds | null>(null);
  const initialElementsSnapshot = useRef<IElement[]>([]);

  const {
    elements,
    updateElement,
    zoom,
    selectedElementIds,
    setCursor,
    clearCursor,
  } = useCanvasStore();

  function selectedElements() {
    return elements.filter((el) =>
      selectedElementIds.includes(el.id),
    );
  }

  function tryStartResize(worldPoint: Point): boolean {
    if (selectedElements().length === 0) return false;

    const bounds = getGroupBounds(selectedElements());
    if (!bounds) return false;

    const handle = getHandleAtPoint(worldPoint, bounds, zoom);

    if (handle) {
      setCursor("grabbing");
      activeHandle.current = handle;
      initialGroupBounds.current = bounds;
      initialElementsSnapshot.current = [...selectedElements()];
      return true;
    }

    return false;
  }

  function updateHoverCursor(worldPoint: Point) {
    if (activeHandle.current || selectedElements().length === 0) return;

    const bounds = getGroupBounds(selectedElements());
    if (!bounds) return;

    const handle = getHandleAtPoint(worldPoint, bounds, zoom);
    if (handle) {
      setCursor("grab");
    } else {
      clearCursor();
    }
  }

  function updateResize(worldPoint: Point): boolean {
    if (
      !activeHandle.current ||
      !initialGroupBounds.current ||
      initialElementsSnapshot.current.length === 0
    ) {
      return false;
    }

    const newGroupBounds = calculateResizeBounds(
      initialGroupBounds.current,
      activeHandle.current,
      worldPoint,
    );

    const initialWidth = initialGroupBounds.current.width || 1;
    const initialHeight = initialGroupBounds.current.height || 1;

    initialElementsSnapshot.current.forEach((selectedEl) => {
      const bounds = selectedEl.getBounds();

      const relX = (bounds.x - initialGroupBounds.current!.x) / initialWidth;
      const relY = (bounds.y - initialGroupBounds.current!.y) / initialHeight;
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
    activeHandle.current = null;
    initialGroupBounds.current = null;
    initialElementsSnapshot.current = [];
  }

  function isResizing() {
    return !!activeHandle.current;
  }

  return {
    isResizing,
    tryStartResize,
    updateHoverCursor,
    updateResize,
    stopResize,
  };
}
