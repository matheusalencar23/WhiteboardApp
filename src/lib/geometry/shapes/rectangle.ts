import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, Point, RectangleElement } from "../types";
import { degreesToRadians } from "../transform";
import { getRotatedEnvelope } from "../envelope";

export function drawRectangle(
  el: RectangleElement,
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
) {
  const cx = el.x + el.width / 2;
  const cy = el.x + el.width / 2;

  ctx.save();

  if (el.angle !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate(degreesToRadians(el.angle));
    ctx.translate(-cx, -cy);
  }

  rc.rectangle(el.x, el.y, el.width, el.height, {
    stroke: el.stroke,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
    bowing: el.bowing,
    seed: el.seed,
    fill: el.fill || undefined,
    fillStyle: el.fillStyle,
  });

  ctx.restore();
}

export function rectangleContainsPoint(
  el: RectangleElement,
  point: Point,
): boolean {
  const { x, y, width, height } = el;
  const minX = Math.min(x, x + width);
  const maxX = Math.max(x, x + width);
  const minY = Math.min(y, y + height);
  const maxY = Math.max(y, y + height);

  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  );
}

export function getRectangleGeometry(el: RectangleElement): Bounds {
  return { x: el.x, y: el.y, width: el.width, height: el.height };
}

export function getRectangleBounds(el: RectangleElement): Bounds {
  const geometryBounds = getRectangleGeometry(el);

  const corners: Point[] = [
    { x: el.x, y: el.y },
    { x: el.x + el.width, y: el.y },
    { x: el.x + el.width, y: el.y + el.height },
    { x: el.x, y: el.y + el.height },
  ];

  return getRotatedEnvelope(corners, geometryBounds, el.angle);
}
