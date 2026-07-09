import { useRef } from "react";
import type { Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import { ElementFactory } from "../lib/geometry/elementFactory";
import { screenToWorld } from "../lib/geometry/utils";

export function useCanvasEvents() {
  const initialPointDraw = useRef<Point>(null);
  const elementDrawnId = useRef<string>(null);

  const {
    elements,
    addElement,
    updateElement,
    activeTool,
    zoom,
    pan,
    setSelectedElementId,
  } = useCanvasStore();

  function handlePointerDown(event: React.PointerEvent) {
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    const worldPoint = screenToWorld(x, y, zoom, pan);
    initialPointDraw.current = worldPoint;

    if (activeTool === "selection") {
      let clickedElementId: string | null = null;

      for (let i = elements.length - 1; i >= 0; i--) {
        if (elements[i].containsPoint({ x: worldPoint.x, y: worldPoint.y })) {
          clickedElementId = elements[i].id;
          break;
        }
      }

      setSelectedElementId(clickedElementId);
      return;
    }

    const el = ElementFactory.create(activeTool!, worldPoint.x, worldPoint.y);
    addElement(el);
    elementDrawnId.current = el.id;
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

    if (activeTool === "selection") return;

    const startX = initialPointDraw.current.x;
    const startY = initialPointDraw.current.y;
    const width = worldPoint.x - startX;
    const height = worldPoint.y - startY;
    const id = elementDrawnId.current;

    const el = ElementFactory.create(
      activeTool!,
      startX,
      startY,
      width,
      height,
      { id },
    );
    updateElement(id, el);
  }

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
