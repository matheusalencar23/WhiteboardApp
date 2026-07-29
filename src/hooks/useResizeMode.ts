import type { Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import { getGroupBounds } from "../lib/geometry/bounds";
import {
  calculateAxisAlignedResizeBounds,
  getHandleAtPoint,
} from "../lib/geometry/handles";
import { calculateRotatedResize } from "../lib/geometry/resize";

export function useResizeMode() {
  const {
    elements: allElements,
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
    setInitialElementsSnapshot,
  } = useCanvasStore();

  function selectedElements() {
    return allElements.filter((el) => selectedElementIds.includes(el.id));
  }

  function getSelectedElementsBound() {
    return selectedElements().length === 1
      ? selectedElements()[0].getLocalBounds()
      : getGroupBounds(selectedElements());
  }

  function getSelectedElementsAngle() {
    return selectedElements().length === 1 ? selectedElements()[0].angle : 0;
  }

  function tryStartResize(worldPoint: Point): boolean {
    if (selectedElements().length === 0) return false;

    const bounds = getSelectedElementsBound();
    if (!bounds) return false;

    const angle = getSelectedElementsAngle();
    const handle = getHandleAtPoint(worldPoint, bounds, zoom, angle);
    if (!handle || handle === "rotation") return false;

    setCursor("grabbing");
    setActiveHandle(handle);
    setInitialGroupBounds(bounds);
    setInitialElementsSnapshot([...selectedElements()]);
    return true;
  }

  function updateHoverCursor(worldPoint: Point) {
    if (activeHandle || selectedElements().length === 0) return;

    const bounds = getSelectedElementsBound();
    if (!bounds) return false;

    const angle = getSelectedElementsAngle();
    const handle = getHandleAtPoint(worldPoint, bounds, zoom, angle);

    if (handle) {
      setCursor("grab");
      return;
    }

    clearCursor();
  }

  function resize(worldPoint: Point) {
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
    resize,
    stopResize,
  };
}
