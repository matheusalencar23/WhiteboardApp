import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, LineElement, Point } from "../types";
import { getRotatedEnvelope } from "../envelope";

function toWorldPoints(el: LineElement): Point[] {
  return el.points.map((p) => ({ x: el.x + p.x, y: el.y + p.y }));
}

export function drawLine(
  el: LineElement,
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
) {
  const geometryBounds = getLineGeometry(el);
  const cx = geometryBounds.x + geometryBounds.width / 2;
  const cy = geometryBounds.y + geometryBounds.height / 2;

  ctx.save();

  if (el.angle !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate((el.angle * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  const worldPoints = toWorldPoints(el);

  rc.linearPath(
    worldPoints.map((p) => [p.x, p.y]),
    {
      stroke: el.stroke,
      strokeWidth: el.strokeWidth,
      roughness: el.roughness,
      bowing: el.bowing,
      seed: el.seed,
    },
  );

  ctx.restore();
}

export function getLineGeometry(el: LineElement): Bounds {
  const xs = el.points.map((p) => p.x);
  const ys = el.points.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: el.x + minX,
    y: el.y + minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function lineContainsPoint(
  el: LineElement,
  point: Point,
  threshold = 6,
): boolean {
  const worldPoints = toWorldPoints(el);

  for (let i = 0; i < worldPoints.length - 1; i++) {
    if (
      distanceToSegment(point, worldPoints[i], worldPoints[i + 1]) <= threshold
    ) {
      return true;
    }
  }

  return false;
}

export function distanceToSegment(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) return Math.hypot(p.x - a.x, p.y - a.y);

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const closest = { x: a.x + t * dx, y: a.y + t * dy };
  return Math.hypot(p.x - closest.x, p.y - closest.y);
}

export function getLineBounds(el: LineElement): Bounds {
  const geometryBounds = getLineGeometry(el);
  return getRotatedEnvelope(toWorldPoints(el), geometryBounds, el.angle);
}
