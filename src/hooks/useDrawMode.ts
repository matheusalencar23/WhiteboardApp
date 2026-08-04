import { useRef } from "react";
import { type Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import { cloneElement, createElement } from "../lib/geometry/createElement";
import { isElementEmpty } from "../lib/geometry/elementOperations";

export function useDrawMode() {
  const startPoint = useRef<Point | null>(null);
  const drawnId = useRef<string | null>(null);

  const { elements, addElement, updateElement, deleteElement, activeTool } =
    useCanvasStore();

  function startDrawing(worldPoint: Point) {
    if (activeTool === "selection") return;

    const el = createElement(activeTool, { x: worldPoint.x, y: worldPoint.y });
    addElement(el);
    drawnId.current = el.id;
    startPoint.current = worldPoint;
  }

  function updateDrawing(worldPoint: Point) {
    if (!startPoint.current || !drawnId.current) return;

    const el = elements.find((el) => el.id === drawnId.current);
    if (!el) return;

    const start = startPoint.current;

    if (el.type === "line") {
      updateElement(
        el.id,
        cloneElement(el, {
          points: [
            { x: 0, y: 0 },
            { x: worldPoint.x - start.x, y: worldPoint.y - start.y },
          ],
        }),
      );
      return;
    }

    updateElement(
      el.id,
      cloneElement(el, {
        x: start.x,
        y: start.y,
        width: worldPoint.x - start.x,
        height: worldPoint.y - start.y,
      }),
    );
  }

  function stopDrawing() {
    const id = drawnId.current;

    if (id) {
      const el = elements.find((el) => el.id === id);
      if (el && isElementEmpty(el)) {
        deleteElement(id);
      }
    }

    startPoint.current = null;
    drawnId.current = null;
  }

  return { startDrawing, updateDrawing, stopDrawing };
}
