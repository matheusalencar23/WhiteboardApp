import { useRef } from "react";
import type { Point } from "../lib/geometry/types";
import { ElementFactory } from "../lib/geometry/elementFactory";
import { useCanvasStore } from "../store/useCanvasStore";

export function useDrawMode() {
  const initialPointDraw = useRef<Point>(null);
  const elementDrawnId = useRef<string>(null);

  const { elements, activeTool, addElement, updateElement } = useCanvasStore();

  function startDrawing(worldPoint: Point) {
    if (!activeTool || activeTool === "selection") return;

    const el = ElementFactory.create(activeTool!, worldPoint.x, worldPoint.y);
    addElement(el);
    elementDrawnId.current = el.id;
    initialPointDraw.current = worldPoint;
  }

  function stopDrawing() {
    initialPointDraw.current = null;
    elementDrawnId.current = null;
  }

  function applyDrawing(worldPoint: Point) {
    if (
      !activeTool ||
      activeTool === "selection" ||
      !initialPointDraw.current ||
      !elementDrawnId.current
    ) {
      return;
    }

    const startX = initialPointDraw.current.x;
    const startY = initialPointDraw.current.y;
    const width = worldPoint.x - startX;
    const height = worldPoint.y - startY;
    const elementDrawn = elements.find(
      (el) => el.id === elementDrawnId.current,
    );

    const el = ElementFactory.create(
      activeTool,
      startX,
      startY,
      width,
      height,
      { ...elementDrawn?.properties },
    );

    updateElement(elementDrawnId.current, el);
  }

  return { startDrawing, stopDrawing, applyDrawing };
}
