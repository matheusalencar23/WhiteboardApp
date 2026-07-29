import { useRef } from "react";
import type { Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import { pointInBounds } from "../lib/geometry/bounds";
import { useSelectedElements } from "./useSelectedElements";

export function useMoveMode() {
  const isDraggingElements = useRef<boolean>(false);
  const lastMouseWorldPoint = useRef<Point | null>(null);

  const { setCursor, updateElement } = useCanvasStore();

  const { selected, bounds } = useSelectedElements();

  function tryStartMoving(worldPoint: Point): boolean {
    if (selected.length === 0 || !bounds) return false;

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

  function applyMove(worldPoint: Point) {
    if (!lastMouseWorldPoint.current) return;

    const deltaX = worldPoint.x - lastMouseWorldPoint.current.x;
    const deltaY = worldPoint.y - lastMouseWorldPoint.current.y;

    const movedElements = selected.map((el) =>
      el.clone({ x: el.x + deltaX, y: el.y + deltaY }),
    );
    movedElements.forEach((el) => updateElement(el.id, el));

    lastMouseWorldPoint.current = worldPoint;
    return;
  }

  return { tryStartMoving, stopMoving, isMoving, applyMove };
}
