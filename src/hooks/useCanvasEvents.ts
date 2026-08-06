import { screenToWorld } from "../lib/canvas/camera";
import { useCanvasStore } from "../store/useCanvasStore";
import { useDrawMode } from "./useDrawMode";
import { useMoveMode } from "./useMoveMode";
import { useResizeMode } from "./useResizeMode";
import { useSelectioMode } from "./useSelectionMode";

export function useCanvasEvents() {
  const { camera, activeTool } = useCanvasStore();
  const drawMode = useDrawMode();
  const selectionMode = useSelectioMode();
  const moveMode = useMoveMode();
  const resizeMode = useResizeMode();

  function worldPointFromPointerEvent(event: React.PointerEvent) {
    return screenToWorld(camera, {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    });
  }

  function handlePointerDown(event: React.PointerEvent) {
    const worldPoint = worldPointFromPointerEvent(event);

    if (activeTool === "selection") {
      const startedResizing = resizeMode.tryStartResizing(worldPoint);
      if (startedResizing) return;

      const startedMoving = moveMode.tryStartMoving(worldPoint);
      if (!startedMoving) {
        selectionMode.startSelection(worldPoint);
      }
      return;
    }

    drawMode.startDrawing(worldPoint);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const worldPoint = worldPointFromPointerEvent(event);

    if (resizeMode.isResizing()) {
      resizeMode.applyResize(worldPoint);
      return;
    }

    if (moveMode.isMoving()) {
      moveMode.applyMove(worldPoint);
      return;
    }

    if (activeTool === "selection") {
      selectionMode.updateSelection(worldPoint);
      return;
    }

    drawMode.updateDrawing(worldPoint);
  }

  function handlePointerUp() {
    drawMode.stopDrawing();
    selectionMode.stopSelection();
    moveMode.stopMoving();
    resizeMode.stopResizing();
  }

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
