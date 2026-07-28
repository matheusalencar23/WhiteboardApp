import { useRef } from "react";
import type { Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import {
  getGroupBounds,
  moveElements,
  pointInBounds,
} from "../lib/geometry/utils";

export function useMoveMode() {
  const isDraggingElements = useRef<boolean>(false);
  const lastMouseWorldPoint = useRef<Point | null>(null);

  const { elements, selectedElementIds, setCursor, updateElement, zoom } =
    useCanvasStore();

  function selectedElements() {
    return elements.filter((el) => selectedElementIds.includes(el.id));
  }

  function tryStartMoving(worldPoint: Point): boolean {
    if (selectedElements().length === 0) return false;

    const bounds = getGroupBounds(selectedElements());
    if (!bounds) return false;

    const clickedOnSelected = pointInBounds(worldPoint, bounds, zoom);
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

    const movedElements = moveElements(selectedElements(), deltaX, deltaY);
    movedElements.forEach((el) => updateElement(el.id, el));

    lastMouseWorldPoint.current = worldPoint;
    return;
  }

  return { tryStartMoving, stopMoving, isMoving, move };
}
