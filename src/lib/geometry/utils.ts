import type { Bounds, IElement, Point } from "./types";

export function screenToWorld(
  screenX: number,
  screenY: number,
  zoom: number,
  pan: Point,
): Point {
  return {
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom,
  };
}

export function getGroupBounds(elements: IElement[]): Bounds | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    const bounds = el.getBounds();

    const elMinX = Math.min(bounds.x, bounds.x + bounds.width);
    const elMaxX = Math.max(bounds.x, bounds.x + bounds.width);
    const elMinY = Math.min(bounds.y, bounds.y + bounds.height);
    const elMaxY = Math.max(bounds.y, bounds.y + bounds.height);

    if (elMinX < minX) minX = elMinX;
    if (elMinY < minY) minY = elMinY;
    if (elMaxX > maxX) maxX = elMaxX;
    if (elMaxY > maxY) maxY = elMaxY;
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
