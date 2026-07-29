import type { Bounds, Point } from "./types";

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

export function screenPointToLocalSpace(
  point: Point,
  bounds: Bounds,
  angle: number,
) {
  if (angle === 0) return point;

  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;

  const matrix = new DOMMatrix()
    .translate(cx, cy)
    .rotate(angle)
    .translate(-cx, -cy)
    .inverse();

  const local = matrix.transformPoint(new DOMPoint(point.x, point.y));
  return { x: local.x, y: local.y };
}
