import { useRef } from "react";
import type { Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import { cloneElement, createElement } from "../lib/geometry/createElement";

const MIN_DRAW_SIZE = 2;

export function useDrawMode() {
  const initialPointDraw = useRef<Point>(null);
  const elementDrawnId = useRef<string>(null);

  const { elements, activeTool, addElement, updateElement, deleteElement } =
    useCanvasStore();

  function startDrawing(worldPoint: Point) {
    if (!activeTool || activeTool === "selection") return;

    const el = createElement(activeTool, { x: worldPoint.x, y: worldPoint.y });
    addElement(el);
    elementDrawnId.current = el.id;
    initialPointDraw.current = worldPoint;
  }

  function stopDrawing() {
    const drawnId = elementDrawnId.current;

    if (drawnId) {
      const el = elements.find((el) => el.id === elementDrawnId.current);
      if (
        el &&
        Math.abs(el.width) < MIN_DRAW_SIZE &&
        Math.abs(el.height) < MIN_DRAW_SIZE
      ) {
        deleteElement(drawnId);
      }
    }
    initialPointDraw.current = null;
    elementDrawnId.current = null;
  }

  function applyDrawing(worldPoint: Point) {
    if (!initialPointDraw.current || !elementDrawnId.current) return;

    const x = initialPointDraw.current.x;
    const y = initialPointDraw.current.y;
    const width = worldPoint.x - x;
    const height = worldPoint.y - y;

    const elementDrawn = elements.find(
      (el) => el.id === elementDrawnId.current,
    );

    if (!elementDrawn) return;
    const el = cloneElement(elementDrawn, {
      x,
      y,
      width,
      height,
    });

    updateElement(elementDrawnId.current, el);
  }

  return { startDrawing, stopDrawing, applyDrawing };
}
