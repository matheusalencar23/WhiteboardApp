import { rotatePoint } from "./transform";
import type { Bounds, Point } from "./types";

/**
 * Desfaz a rotação de um ponto em relação a um elemento — inverso de
 * "desenhar" (que gira pontos locais por `angle` em torno do centro).
 * Equivalente a rotatePoint(point, centro, -angle).
 */
export function toShapeSpace(
  point: Point,
  bounds: Bounds,
  angle: number,
): Point {
  if (angle === 0) return point;

  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  const center: Point = { x: cx, y: cy };
  return rotatePoint(point, center, -angle);
}
