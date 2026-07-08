import { useRef } from "react";
import type { Point } from "../lib/geometry/types";
import { Rectangle } from "../lib/geometry/rectangle";
import { useCanvasStore } from "../store/useCanvasStore";
import { ElementFactory } from "../lib/geometry/elementFactory";
import { screenToWorld } from "../lib/geometry/utils";

export function useCanvasEvents() {
  const initialPointDraw = useRef<Point>(null);
  const elementDrawnId = useRef<string>(null);

  const { addElement, updateElement, activeTool, zoom, pan } = useCanvasStore();

  function handlePointerDown(event: React.PointerEvent) {
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    const worldPoint = screenToWorld(x, y, zoom, pan);
    initialPointDraw.current = worldPoint;

    if (activeTool === "rectangle") {
      const el = ElementFactory.create(activeTool, worldPoint.x, worldPoint.y);
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

    const worldPoint = screenToWorld(x, y, zoom, pan);

    if (activeTool === "rectangle") {
      const id = elementDrawnId.current;
      const startX = initialPointDraw.current.x;
      const startY = initialPointDraw.current.y;
      const width = worldPoint.x - startX;
      const height = worldPoint.y - startY;
      const props = { id };
      const el = new Rectangle(startX, startY, width, height, props);
      updateElement(id, el);
    }
  }

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
