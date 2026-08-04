import { rotatePoint } from "./transform";
import type { Bounds, Point } from "./types";

export function getRotatedEnvelope(
  worldPoints: Point[],
  shapeGeometry: Bounds,
  angle: number,
): Bounds {
  console.log('chegou aqui')
  if (angle === 0) return shapeGeometry;

  const center = {
    x: shapeGeometry.x + shapeGeometry.width / 2,
    y: shapeGeometry.y + shapeGeometry.height / 2,
  };

  const rotated = worldPoints.map((p) => rotatePoint(p, center, angle));
  const xs = rotated.map((p) => p.x);
  const ys = rotated.map((p) => p.y);

  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const width = Math.max(...xs) - x;
  const height = Math.max(...ys) - y;

  return { x, y, width, height };
}
