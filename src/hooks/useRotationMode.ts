import { useRef } from "react";
import type { Bounds, CanvasElement, Point } from "../lib/geometry/types";
import { calculateRotationAngle, rotatePoint } from "../lib/geometry/transform";
import { useCanvasStore } from "../store/useCanvasStore";
import { getHandleAtPoint } from "../lib/geometry/handles";
import { useSelectedElements } from "./useSelectedElements";
import { cloneElement } from "../lib/geometry/createElement";
import { getElementLocalBounds } from "../lib/geometry/elementOperations";

export function useRotationMode() {
  const initialMouseAngle = useRef<number>(0);
  const initialElementAngles = useRef<Map<string, number>>(new Map());
  const initialGroupBounds = useRef<Bounds | null>(null);
  const initialElementsSnapshot = useRef<CanvasElement[]>([]);

  const { updateElement, zoom, activeHandle, setActiveHandle } =
    useCanvasStore();

  const { selected, angle, bounds } = useSelectedElements();

  function tryStartRotation(worldPoint: Point): boolean {
    if (selected.length === 0 || !bounds) return false;

    const handle = getHandleAtPoint(worldPoint, bounds, zoom, angle);
    if (!handle || handle !== "rotation") return false;

    setActiveHandle(handle);
    initialGroupBounds.current = bounds;
    initialElementsSnapshot.current = [...selected];

    const groupCenter: Point = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };

    initialMouseAngle.current = calculateRotationAngle(groupCenter, worldPoint);

    selected.forEach((el) => {
      initialElementAngles.current.set(el.id, el.angle || 0);
    });

    return true;
  }

  function stopRotation() {
    setActiveHandle(null);
    initialGroupBounds.current = null;
    initialElementsSnapshot.current = [];
  }

  function isRotating() {
    return !!activeHandle && activeHandle === "rotation";
  }

  function applyRotation(worldPoint: Point) {
    const bounds = initialGroupBounds.current;
    if (!bounds) return;

    const groupCenter: Point = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };

    const newMouseAngle = calculateRotationAngle(groupCenter, worldPoint);

    const deltaAngle = newMouseAngle - initialMouseAngle.current;

    initialElementsSnapshot.current.forEach((el) => {
      const startAngle = initialElementAngles.current.get(el.id) || 0;
      let newAngle = (startAngle + deltaAngle) % 360;
      if (newAngle < 0) newAngle += 360;

      const localBounds = getElementLocalBounds(el);
      const origCenter: Point = {
        x: localBounds.x + localBounds.width / 2,
        y: localBounds.y + localBounds.height / 2,
      };

      const newCenter = rotatePoint(origCenter, groupCenter, deltaAngle);
      const x = el.x + (newCenter.x - origCenter.x);
      const y = el.y + (newCenter.y - origCenter.y);

      const updatedEl = cloneElement(el, { x, y, angle: newAngle });
      updateElement(el.id, updatedEl);
    });
    return;
  }

  return { tryStartRotation, stopRotation, isRotating, applyRotation };
}
