import { useRef } from "react";
import type { Point } from "../lib/geometry/types";
import { calculateRotationAngle, rotatePoint } from "../lib/geometry/transform";
import { useCanvasStore } from "../store/useCanvasStore";
import { getGroupBounds } from "../lib/geometry/bounds";
import { getHandleAtPoint } from "../lib/geometry/handles";

export function useRotationMode() {
  const initialMouseAngle = useRef<number>(0);
  const initialElementAngles = useRef<Map<string, number>>(new Map());

  const {
    elements: allElements,
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
    return allElements.filter((el) => selectedElementIds.includes(el.id));
  }

  function getSelectedElementsBound() {
    return selectedElements().length === 1
      ? selectedElements()[0].getLocalBounds()
      : getGroupBounds(selectedElements());
  }

  function getSelectedElementsAngle() {
    return selectedElements().length === 1 ? selectedElements()[0].angle : 0;
  }

  function tryStartRotation(worldPoint: Point): boolean {
    if (selectedElements().length === 0) return false;

    const bounds = getSelectedElementsBound();
    if (!bounds) return false;

    const angle = getSelectedElementsAngle();
    const handle = getHandleAtPoint(worldPoint, bounds, zoom, angle);
    if (!handle || handle !== "rotation") return false;

    setActiveHandle(handle);
    setInitialGroupBounds(bounds);
    setInitialElementsSnapshot([...selectedElements()]);

    const groupCenter: Point = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };

    initialMouseAngle.current = calculateRotationAngle(groupCenter, worldPoint);

    selectedElements().forEach((el) => {
      initialElementAngles.current.set(el.id, el.angle || 0);
    });

    return true;
  }

  function stopRotation() {
    setActiveHandle(null);
    setInitialGroupBounds(null);
    setInitialElementsSnapshot([]);
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

    const newMouseAngle = calculateRotationAngle(groupCenter, worldPoint);

    const deltaAngle = newMouseAngle - initialMouseAngle.current;

    initialElementsSnapshot.forEach((el) => {
      const startAngle = initialElementAngles.current.get(el.id) || 0;

      let newAngle = (startAngle + deltaAngle) % 360;
      if (newAngle < 0) newAngle += 360;

      const origCenter: Point = {
        x: el.x + el.width / 2,
        y: el.y + el.height / 2,
      };

      const newCenter = rotatePoint(origCenter, groupCenter, deltaAngle);
      const x = newCenter.x - el.width / 2;
      const y = newCenter.y - el.height / 2;

      const updatedEl = el.clone({ x, y, angle: newAngle });
      updateElement(el.id, updatedEl);
    });
    return;
  }

  return { tryStartRotation, stopRotation, isRotating, rotate };
}
