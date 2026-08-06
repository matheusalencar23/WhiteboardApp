import { useRef } from "react";
import { getHandlePositions, RESIZE_HANDLE_TYPES } from "../lib/canvas/handles";
import {
  type Bounds,
  type CanvasElement,
  type HandleType,
  type Point,
} from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import { useSelectedElements } from "./useSelectedElements";
import { toShapeSpace } from "../lib/geometry/coordinates";
import {
  applyBoundsToElement,
  getElementGeometry,
} from "../lib/geometry/elementOperations";
import {
  calculateGroupResize,
  calculateRotatedResize,
} from "../lib/geometry/resize";

const HIT_RADIUS = 8;

export function useResizeMode() {
  const activeHandle = useRef<HandleType | null>(null);
  const startBounds = useRef<Bounds | null>(null);
  const startSnapshot = useRef<CanvasElement[]>([]);

  const { selected, bounds, angle } = useSelectedElements();
  const { camera, setCursor, updateElement } = useCanvasStore();

  function tryStartResizing(worldPoint: Point): boolean {
    if (selected.length === 0 || !bounds) return false;

    const testPoint = toShapeSpace(worldPoint, bounds, angle);
    const hitRadius = HIT_RADIUS / camera.zoom;
    const positions = getHandlePositions(bounds, camera.zoom);

    const hit = RESIZE_HANDLE_TYPES.find((type) => {
      const p = positions[type];
      return (
        Math.abs(testPoint.x - p.x) <= hitRadius &&
        Math.abs(testPoint.y - p.y) <= hitRadius
      );
    });

    if (!hit) return false;

    activeHandle.current = hit;
    startBounds.current = bounds;
    startSnapshot.current = [...selected];
    setCursor("grabbing");
    return true;
  }

  function applyResize(worldPoint: Point) {
    const handle = activeHandle.current;
    const groupBounds = startBounds.current;
    const snapshot = startSnapshot.current;

    if (!handle || !groupBounds || snapshot.length === 0) return;

    if (snapshot.length === 1) {
      const el = snapshot[0];
      const oldGeometry = getElementGeometry(el);
      const newBounds = calculateRotatedResize(
        oldGeometry,
        el.angle,
        handle,
        worldPoint,
      );
      updateElement(el.id, applyBoundsToElement(el, oldGeometry, newBounds));
      return;
    }

    const resized = calculateGroupResize(
      snapshot,
      groupBounds,
      handle,
      worldPoint,
      getElementGeometry,
    );
    resized.forEach(({ id, bounds: newBounds }) => {
      const el = snapshot.find((e) => e.id === id)!;
      const oldGeometry = getElementGeometry(el);
      updateElement(id, applyBoundsToElement(el, oldGeometry, newBounds));
    });
  }

  function isResizing() {
    return activeHandle.current !== null;
  }

  function stopResizing() {
    activeHandle.current = null;
    startBounds.current = null;
    startSnapshot.current = [];
  }

  return { tryStartResizing, applyResize, isResizing, stopResizing };
}
