import { ElementFactory } from "../lib/geometry/elementFactory";
import type { Point } from "../lib/geometry/types";
import {
  calculateRotationAngle,
  getGroupBounds,
  getHandleAtPoint,
} from "../lib/geometry/utils";
import { useCanvasStore } from "../store/useCanvasStore";

export function useRotationMode() {
  const {
    elements,
    updateElement,
    zoom,
    selectedElementIds,
    activeHandle,
    setActiveHandle,
    initialGroupBounds,
    setInitialGroupBounds,
    initialElementsSnapshot,
    setInitialElementsSnapshot,
  } = useCanvasStore();

  function selectedElements() {
    return elements.filter((el) => selectedElementIds.includes(el.id));
  }

  function tryStartRotation(worldPoint: Point): boolean {
    if (selectedElements().length === 0) return false;

    const bounds = getGroupBounds(selectedElements());
    if (!bounds) return false;

    const handle = getHandleAtPoint(worldPoint, bounds, zoom);
    if (!handle || handle !== "rotation") return false;

    setActiveHandle(handle);
    setInitialGroupBounds(bounds);
    setInitialElementsSnapshot([...selectedElements()])

    return true;
  }

  function stopRotation() {
    setActiveHandle(null);
  }

  function isRotating() {
    return !!activeHandle && activeHandle === "rotation";
  }

  function rotate(worldPoint: Point) {
    const bounds = initialGroupBounds;
    if (!bounds) return;

    const groupCenter: Point = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };

    const newAngle = calculateRotationAngle(groupCenter, worldPoint);

    initialElementsSnapshot.forEach((el) => {
      const bounds = el.getBounds();
      const updated = ElementFactory.create(
        el.type!,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        {
          id: el.id,
          seed: el.seed,
          angle: newAngle,
          stroke: el.stroke,
          strokeWidth: el.strokeWidth,
          roughness: el.roughness,
          bowing: el.bowing,
        },
      );
      updateElement(el.id, updated);
    });
    return;
  }

  return { tryStartRotation, stopRotation, isRotating, rotate };
}
