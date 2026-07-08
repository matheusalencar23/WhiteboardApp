import type { Point } from "./types";

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
