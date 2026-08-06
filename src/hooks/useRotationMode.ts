import { useRef } from "react";
import type { Bounds, CanvasElement, Point } from "../lib/geometry/types";
import { useSelectedElements } from "./useSelectedElements";
import { useCanvasStore } from "../store/useCanvasStore";
import { toShapeSpace } from "../lib/geometry/coordinates";
import { getHandlePositions } from "../lib/canvas/handles";
import { calculateRotationAngle, rotatePoint } from "../lib/geometry/transform";
import {
  getElementGeometry,
  moveElement,
} from "../lib/geometry/elementOperations";
import { cloneElement } from "../lib/geometry/createElement";

const HIT_RADIUS = 8;

export function useRotationMode() {
  const isRotating = useRef(false);
  const startBounds = useRef<Bounds | null>(null);
  const startSnapshot = useRef<CanvasElement[]>([]);
  const startMouseAngle = useRef(0);
  const startElementAngles = useRef<Map<string, number>>(new Map());

  const { selected, bounds, angle } = useSelectedElements();
  const { camera, updateElement } = useCanvasStore();

  function tryStartRotating(worldPoint: Point): boolean {
    if (selected.length === 0 || !bounds) return false;

    const testPoint = toShapeSpace(worldPoint, bounds, angle);
    const hitRadius = HIT_RADIUS / camera.zoom;
    const rotationHandle = getHandlePositions(bounds, camera.zoom).rotation;

    const hit =
      Math.abs(testPoint.x - rotationHandle.x) <= hitRadius &&
      Math.abs(testPoint.y - rotationHandle.y) <= hitRadius;

    if (!hit) return false;

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const center = { x: cx, y: cy };

    isRotating.current = true;
    startBounds.current = bounds;
    startSnapshot.current = [...selected];
    startMouseAngle.current = calculateRotationAngle(center, worldPoint);
    startElementAngles.current = new Map(
      selected.map((el) => [el.id, el.angle || 0]),
    );

    return true;
  }

  function applyRotation(worldPoint: Point) {
    const groupBounds = startBounds.current;

    if (!isRotating.current || !groupBounds) return;

    const cx = groupBounds.x + groupBounds.width / 2;
    const cy = groupBounds.y + groupBounds.height / 2;
    const center = { x: cx, y: cy };
    const currentMouseAngle = calculateRotationAngle(center, worldPoint);
    const deltaAngle = currentMouseAngle - startMouseAngle.current;

    startSnapshot.current.forEach((el) => {
      const startAngle = startElementAngles.current.get(el.id) ?? 0;
      let newAngle = (startAngle + deltaAngle) % 360;
      if (newAngle < 0) newAngle += 360;

      const elGeometry = getElementGeometry(el);
      const cx = elGeometry.x + elGeometry.width / 2;
      const cy = elGeometry.y + elGeometry.height / 2;
      const elCenter = { x: cx, y: cy };
      const newCenter = rotatePoint(elCenter, center, deltaAngle);

      const deltaX = newCenter.x - elCenter.x;
      const deltaY = newCenter.y - elCenter.y;

      const moved = moveElement(el, deltaX, deltaY);
      updateElement(el.id, cloneElement(moved, { angle: newAngle }));
    });
  }

  function stopRotating() {
    isRotating.current = false;
    startBounds.current = null;
    startSnapshot.current = [];
    startElementAngles.current = new Map();
  }

  return {
    tryStartRotating,
    applyRotation,
    stopRotating,
    isRotating: () => isRotating.current,
  };
}
