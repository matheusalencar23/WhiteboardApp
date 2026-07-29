import { useRef } from "react";
import type { Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import { getGroupBounds, pointInBounds } from "../lib/geometry/bounds";

export function useMoveMode() {
  const isDraggingElements = useRef<boolean>(false);
  const lastMouseWorldPoint = useRef<Point | null>(null);

  const {
    elements: allElements,
    selectedElementIds,
    setCursor,
    updateElement,
  } = useCanvasStore();

  function selectedElements() {
    return allElements.filter((el) => selectedElementIds.includes(el.id));
  }

  function tryStartMoving(worldPoint: Point): boolean {
    if (selectedElements().length === 0) return false;

    const bounds = getGroupBounds(selectedElements());
    if (!bounds) return false;

    const clickedOnSelected = pointInBounds(worldPoint, bounds);
    if (!clickedOnSelected) return false;

    lastMouseWorldPoint.current = worldPoint;
    isDraggingElements.current = true;
    setCursor("grabbing");
    return true;
  }

  function stopMoving() {
    lastMouseWorldPoint.current = null;
    isDraggingElements.current = false;
  }

  function isMoving() {
    return !!isDraggingElements.current && !!lastMouseWorldPoint.current;
  }

  function move(worldPoint: Point) {
    if (!lastMouseWorldPoint.current) return;

    const deltaX = worldPoint.x - lastMouseWorldPoint.current.x;
    const deltaY = worldPoint.y - lastMouseWorldPoint.current.y;

    const movedElements = selectedElements().map((el) =>
      el.clone({ x: el.x + deltaX, y: el.y + deltaY }),
    );
    movedElements.forEach((el) => updateElement(el.id, el));

    lastMouseWorldPoint.current = worldPoint;
    return;
  }

  return { tryStartMoving, stopMoving, isMoving, move };
}
