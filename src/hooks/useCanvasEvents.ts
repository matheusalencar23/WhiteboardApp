import { useRef } from "react";
import type { Point } from "../lib/geometry/types";
import { Rectangle } from "../lib/geometry/rectangle";
import { useCanvasStore } from "../store/useCanvasStore";
import { ElementFactory } from "../lib/geometry/elementFactory";

export function useCanvasEvents() {
  const initialPointDraw = useRef<Point>(null);
  const elementDrawnId = useRef<string>(null);

  const { addElement, updateElement, activeTool } = useCanvasStore();

  function handlePointerDown(event: React.PointerEvent) {
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;
    initialPointDraw.current = { x, y };
    if (activeTool === "rectangle") {
      const el = ElementFactory.create(activeTool, x, y);
      addElement(el);
      elementDrawnId.current = el.id;
    }
  }

  function handlePointerUp() {
    initialPointDraw.current = null;
    elementDrawnId.current = null;
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!initialPointDraw.current || !elementDrawnId.current) return;

    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    if (activeTool === "rectangle") {
      const id = elementDrawnId.current;
      const startX = initialPointDraw.current.x;
      const startY = initialPointDraw.current.y;
      const width = x - initialPointDraw.current.x;
      const height = y - initialPointDraw.current.y;
      const props = { id };
      const el = new Rectangle(startX, startY, width, height, props);
      updateElement(id, el);
    }
  }

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
