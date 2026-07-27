import { useCanvasStore } from "../store/useCanvasStore";
import { screenToWorld } from "../lib/geometry/utils";
import { useResizeMode } from "./useResizeMode";
import { useSelectionMode } from "./useSelectionMode";
import { useDrawMode } from "./useDrawMode";

export function useCanvasEvents() {
  const resizeMode = useResizeMode();
  const selectionMode = useSelectionMode();
  const drawMode = useDrawMode();

  const { activeTool, zoom, pan, setSelectionBox, clearCursor } =
    useCanvasStore();

  function handlePointerDown(event: React.PointerEvent) {
    const worldPoint = screenToWorld(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
      zoom,
      pan,
    );

    if (activeTool === "selection") {
      const hitHandle = resizeMode.tryStartResize(worldPoint);
      if (!hitHandle) {
        selectionMode.startSelection(worldPoint);
      }

      return;
    }

    drawMode.startDrawing(worldPoint);
  }

  function handlePointerUp() {
    drawMode.stopDrawing();
    resizeMode.stopResize();
    clearCursor();
    setSelectionBox(null);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const worldPoint = screenToWorld(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
      zoom,
      pan,
    );

    resizeMode.updateHoverCursor(worldPoint);

    if (resizeMode.isResizing()) {
      resizeMode.updateResize(worldPoint);
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
