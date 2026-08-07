import { useRef } from "react";
import { type Point } from "../lib/geometry/types";
import { useSelectedElements } from "./useSelectedElements";
import { useCanvasStore } from "../store/useCanvasStore";
import { moveElement } from "../lib/geometry/elementOperations";
import { toShapeSpace } from "../lib/geometry/coordinates";

export function useMoveMode() {
  const isDragging = useRef(false);
  const lastPoint = useRef<Point | null>(null);

  const { selected, bounds, angle } = useSelectedElements();
  const { setCursor, updateElement } = useCanvasStore();

  function tryStartMoving(worldPoint: Point): boolean {
    if (selected.length === 0 || !bounds) return false;

    const testPoint = toShapeSpace(worldPoint, bounds, angle);

    const clickedOnSelection =
      testPoint.x >= bounds.x &&
      testPoint.x <= bounds.x + bounds.width &&
      testPoint.y >= bounds.y &&
      testPoint.y <= bounds.y + bounds.height;

    if (!clickedOnSelection) return false;

    isDragging.current = true;
    lastPoint.current = worldPoint;
    setCursor("grabbing");
    return true;
  }

  function applyMove(worldPoint: Point) {
    if (!lastPoint.current) return;

    const deltaX = worldPoint.x - lastPoint.current.x;
    const deltaY = worldPoint.y - lastPoint.current.y;

    selected.forEach((el) =>
      updateElement(el.id, moveElement(el, deltaX, deltaY)),
    );

    lastPoint.current = worldPoint;
  }

  function stopMoving() {
    isDragging.current = false;
    lastPoint.current = null;
    setCursor("default");
  }

  function isMoving() {
    return isDragging.current;
  }

  return { tryStartMoving, applyMove, stopMoving, isMoving };
}
