import { useCanvasStore } from "../store/useCanvasStore";
import { screenToWorld } from "../lib/geometry/utils";
import { useResizeMode } from "./useResizeMode";
import { useSelectionMode } from "./useSelectionMode";
import { useDrawMode } from "./useDrawMode";
import { useMoveMode } from "./useMoveMode";
import { useRotationMode } from "./useRotationMode";

export function useCanvasEvents() {
  const resizeMode = useResizeMode();
  const selectionMode = useSelectionMode();
  const drawMode = useDrawMode();
  const moveMode = useMoveMode();
  const rotationMode = useRotationMode();

  const { activeTool, zoom, pan, setSelectionBox, clearCursor } =
    useCanvasStore();

  function worldPointFromPointerEvent(event: React.PointerEvent) {
    return screenToWorld(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
      zoom,
      pan,
    );
  }

  function handlePointerDown(event: React.PointerEvent) {
    const worldPoint = worldPointFromPointerEvent(event);

    if (activeTool === "selection") {
      const hitResizeHandle = resizeMode.tryStartResize(worldPoint);
      const hitRotationHandle = rotationMode.tryStartRotation(worldPoint);
      const hitSelection = moveMode.tryStartMoving(worldPoint);

      if (!hitResizeHandle && !hitSelection && !hitRotationHandle) {
        selectionMode.startSelection(worldPoint);
      }

      return;
    }

    drawMode.startDrawing(worldPoint);
  }

  function handlePointerUp() {
    drawMode.stopDrawing();
    resizeMode.stopResize();
    moveMode.stopMoving();
    rotationMode.stopRotation();
    clearCursor();
    setSelectionBox(null);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const worldPoint = worldPointFromPointerEvent(event);

    resizeMode.updateHoverCursor(worldPoint);

    if (resizeMode.isResizing()) {
      resizeMode.resize(worldPoint);
      return;
    }

    if (rotationMode.isRotating()) {
      rotationMode.rotate(worldPoint);
      return;
    }

    if (moveMode.isMoving()) {
      moveMode.move(worldPoint);
      return;
    }

    if (activeTool === "selection") {
      selectionMode.updateSelection(worldPoint);
      return;
    }

    drawMode.updateDrawing(worldPoint);
  }

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
