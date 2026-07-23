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
    setSelectedElementIds,
    selectionBox,
    setSelectionBox,
  } = useCanvasStore();

  function handlePointerDown(event: React.PointerEvent) {
    setSelectedElementId(null);
    setSelectedElementIds([]);
    
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

      if (clickedElementId) {
        setSelectedElementId(clickedElementId);
        setSelectedElementIds([]);
      } else {
        setSelectedElementId(null);
        setSelectionBox({ start: worldPoint, current: worldPoint });
      }

      return;
    }

    const el = ElementFactory.create(activeTool!, worldPoint.x, worldPoint.y);
    addElement(el);
    elementDrawnId.current = el.id;
  }

  function handlePointerUp() {
    initialPointDraw.current = null;
    elementDrawnId.current = null;
    setSelectionBox(null);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    const worldPoint = screenToWorld(x, y, zoom, pan);

    if (activeTool === "selection") {
      if (!selectionBox) return;
      const { start, current } = selectionBox!;
      if (!start || !current) return;
      setSelectionBox({ start, current: worldPoint });
      const minX = Math.min(start.x, current.x);
      const maxX = Math.max(start.x, current.x);
      const minY = Math.min(start.y, current.y);
      const maxY = Math.max(start.y, current.y);

      const elementsInsideIds = elements
        .filter((el) => {
          const { x, y, width, height } = el.getBounds();

          return (
            x >= minX && x + width <= maxX && y >= minY && y + height <= maxY
          );
        })
        .map((el) => el.id);

      setSelectedElementIds(elementsInsideIds);

      return;
    }

    if (!initialPointDraw.current || !elementDrawnId.current) return;

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
