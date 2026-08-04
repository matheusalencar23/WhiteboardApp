import { screenToWorld } from "../lib/canvas/camera";
import { useCanvasStore } from "../store/useCanvasStore";
import { useDrawMode } from "./useDrawMode";

export function useCanvasEvents() {
  const { camera, activeTool } = useCanvasStore();
  const drawMode = useDrawMode();

  function worldPointFromPointerEvent(event: React.PointerEvent) {
    return screenToWorld(camera, {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    });
  }

  function handlePointerDown(event: React.PointerEvent) {
    const worldPoint = worldPointFromPointerEvent(event);

    if (activeTool === "selection") return;

    drawMode.startDrawing(worldPoint);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const worldPoint = worldPointFromPointerEvent(event);

    if (activeTool === "selection") return;

    drawMode.updateDrawing(worldPoint);
  }

  function handlePointerUp() {
    drawMode.stopDrawing();
  }

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
