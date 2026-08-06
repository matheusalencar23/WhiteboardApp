import { screenToWorld } from "../lib/canvas/camera";
import { useCanvasStore } from "../store/useCanvasStore";
import { useDrawMode } from "./useDrawMode";
import { useMoveMode } from "./useMoveMode";
import { useResizeMode } from "./useResizeMode";
import { useRotationMode } from "./useRotationMode";
import { useSelectioMode } from "./useSelectionMode";

export function useCanvasEvents() {
  const { camera, activeTool } = useCanvasStore();
  const drawMode = useDrawMode();
  const selectionMode = useSelectioMode();
  const moveMode = useMoveMode();
  const resizeMode = useResizeMode();
  const rotationMode = useRotationMode();

  function worldPointFromPointerEvent(event: React.PointerEvent) {
    return screenToWorld(camera, {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    });
  }

  function handlePointerDown(event: React.PointerEvent) {
    const worldPoint = worldPointFromPointerEvent(event);

    if (activeTool === "selection") {
      const startedRotating = rotationMode.tryStartRotating(worldPoint);
      if (startedRotating) return;

      const startedResizing = resizeMode.tryStartResizing(worldPoint);
      if (startedResizing) return;

      const startedMoving = moveMode.tryStartMoving(worldPoint);
      if (!startedMoving) {
        selectionMode.startSelection(worldPoint, event.shiftKey);
      }
      return;
    }

    drawMode.startDrawing(worldPoint);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const worldPoint = worldPointFromPointerEvent(event);

    if (!resizeMode.updateHoverCursor(worldPoint)) {
      rotationMode.updateHoverCursor(worldPoint);
    }

    if (rotationMode.isRotating()) {
      rotationMode.applyRotation(worldPoint);
      return;
    }

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
    rotationMode.stopRotating();
  }

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
