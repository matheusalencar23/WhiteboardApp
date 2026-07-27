import { useRef } from "react";
import type {
  Bounds,
  HandleType,
  IElement,
  Point,
} from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import { ElementFactory } from "../lib/geometry/elementFactory";
import {
  calculateResizeBounds,
  getGroupBounds,
  getHandleAtPoint,
  screenToWorld,
} from "../lib/geometry/utils";

export function useCanvasEvents() {
  const initialPointDraw = useRef<Point>(null);
  const elementDrawnId = useRef<string>(null);
  const activeHandle = useRef<HandleType | null>(null);
  const initialGroupBounds = useRef<Bounds | null>(null);
  const initialElementsSnapshot = useRef<IElement[]>([]);

  const {
    elements,
    addElement,
    updateElement,
    activeTool,
    zoom,
    pan,
    selectedElementIds,
    setSelectedElementIds,
    selectionBox,
    setSelectionBox,
    setCursor,
    clearCursor,
  } = useCanvasStore();

  function handlePointerDown(event: React.PointerEvent) {
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    const worldPoint = screenToWorld(x, y, zoom, pan);
    initialPointDraw.current = worldPoint;

    if (activeTool === "selection") {
      if (selectedElementIds && selectedElementIds.length > 0) {
        const selectedElements = elements.filter((el) =>
          selectedElementIds.includes(el.id),
        );
        if (selectedElements && selectedElements.length > 0) {
          const bounds = getGroupBounds(selectedElements);
          if (bounds) {
            const handle = getHandleAtPoint(worldPoint, bounds, zoom);

            if (handle) {
              setCursor("grabbing");
              activeHandle.current = handle;
              initialGroupBounds.current = bounds;
              initialElementsSnapshot.current = [...selectedElements];
              return;
            }
          }
        }
      }

      setSelectedElementIds([]);
      let clickedElementId: string | null = null;

      for (let i = elements.length - 1; i >= 0; i--) {
        if (elements[i].containsPoint({ x: worldPoint.x, y: worldPoint.y })) {
          clickedElementId = elements[i].id;
          break;
        }
      }

      if (clickedElementId) {
        setSelectedElementIds([clickedElementId]);
      } else {
        setSelectedElementIds([]);
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
    activeHandle.current = null;
    initialGroupBounds.current = null;
    initialElementsSnapshot.current = [];
    clearCursor();
    setSelectionBox(null);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    const worldPoint = screenToWorld(x, y, zoom, pan);

    if (
      !activeHandle.current &&
      selectedElementIds &&
      selectedElementIds.length > 0
    ) {
      const selectedElements = elements.filter((el) =>
        selectedElementIds.includes(el.id),
      );
      if (selectedElements && selectedElements.length > 0) {
        const bounds = getGroupBounds(selectedElements);

        if (bounds) {
          const handle = getHandleAtPoint(worldPoint, bounds, zoom);

          if (handle) {
            setCursor("grab");
          } else {
            clearCursor();
          }
        }
      }
    }

    if (
      activeHandle.current &&
      initialGroupBounds.current &&
      initialElementsSnapshot.current.length > 0
    ) {
      const newGroupBounds = calculateResizeBounds(
        initialGroupBounds.current,
        activeHandle.current,
        worldPoint,
      );

      const initialWidth = initialGroupBounds.current.width || 1;
      const initialHeight = initialGroupBounds.current.height || 1;

      initialElementsSnapshot.current.forEach((selectedEl) => {
        const bounds = selectedEl.getBounds();

        const relX = (bounds.x - initialGroupBounds.current!.x) / initialWidth;
        const relY = (bounds.y - initialGroupBounds.current!.y) / initialHeight;
        const relWidth = bounds.width / initialWidth;
        const relHeight = bounds.height / initialHeight;

        const newX = newGroupBounds.x + relX * newGroupBounds.width;
        const newY = newGroupBounds.y + relY * newGroupBounds.height;
        const newW = relWidth * newGroupBounds.width;
        const newH = relHeight * newGroupBounds.height;

        const id = selectedEl.id;
        const el = ElementFactory.create(
          selectedEl.type!,
          newX,
          newY,
          newW,
          newH,
          { id },
        );

        updateElement(id, el);
      });

      return;
    }

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
