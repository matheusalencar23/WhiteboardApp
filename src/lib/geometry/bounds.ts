import { getElementBounds } from "./elementOperations";
import type { Bounds, CanvasElement, Point } from "./types";

export function getGroupBounds(elements: CanvasElement[]): Bounds | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    const bounds = getElementBounds(el);
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function pointInBounds(point: Point, bounds: Bounds): boolean {
  const left = bounds.x;
  const right = bounds.x + bounds.width;
  const top = bounds.y;
  const bottom = bounds.y + bounds.height;

  const minX = Math.min(left, right);
  const maxX = Math.max(left, right);
  const minY = Math.min(top, bottom);
  const maxY = Math.max(top, bottom);

  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  );
}
