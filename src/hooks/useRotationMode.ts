import { useRef } from "react";
import { ElementFactory } from "../lib/geometry/elementFactory";
import type { Point } from "../lib/geometry/types";
import {
  calculateRotationAngle,
  getGroupBounds,
  getHandleAtPoint,
  rotatePoint,
} from "../lib/geometry/utils";
import { useCanvasStore } from "../store/useCanvasStore";

export function useRotationMode() {
  const initialMouseAngle = useRef<number>(0);
  const initialElementAngles = useRef<Map<string, number>>(new Map());

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

    const elements = selectedElements();
    let bounds;
    if (elements.length === 1) {
      bounds = elements[0].getLocalBounds();
    } else {
      bounds = getGroupBounds(selectedElements());
    }

    if (!bounds) return false;

    const handle = getHandleAtPoint(
      worldPoint,
      bounds,
      zoom,
      elements.length === 1 ? elements[0].angle : 0,
    );
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
      const newX = newCenter.x - el.width / 2;
      const newY = newCenter.y - el.height / 2;

      const updated = ElementFactory.create(
        el.type!,
        newX,
        newY,
        el.width,
        el.height,
        {
          ...el.properties,
          angle: newAngle,
        },
      );
      updateElement(el.id, updated);
    });
    return;
  }

  return { tryStartRotation, stopRotation, isRotating, rotate };
}
