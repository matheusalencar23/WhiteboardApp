import { screenToWorld } from "../lib/canvas/camera";
import { useCanvasStore } from "../store/useCanvasStore";
import { useDrawMode } from "./useDrawMode";
import { useMoveMode } from "./useMoveMode";
import { useSelectioMode } from "./useSelectionMode";

export function useCanvasEvents() {
  const { camera, activeTool } = useCanvasStore();
  const drawMode = useDrawMode();
  const selectionMode = useSelectioMode();
  const moveMode = useMoveMode();

  function worldPointFromPointerEvent(event: React.PointerEvent) {
    return screenToWorld(camera, {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    });
  }

  function handlePointerDown(event: React.PointerEvent) {
    const worldPoint = worldPointFromPointerEvent(event);

    if (activeTool === "selection") {
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
  }

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
