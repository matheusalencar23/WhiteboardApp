import { screenToWorld } from "../lib/canvas/camera";
import { useCanvasStore } from "../store/useCanvasStore";

export function useCanvasEvents() {
  const { camera } = useCanvasStore();

  function worldPointFromPointerEvent(event: React.PointerEvent) {
    return screenToWorld(camera, {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    });
  }

  function handlePointerDown(event: React.PointerEvent) {
    void worldPointFromPointerEvent(event);
  }

  function handlePointerMove(event: React.PointerEvent) {
    void worldPointFromPointerEvent(event);
  }

  function handlePointerUp() {}

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
