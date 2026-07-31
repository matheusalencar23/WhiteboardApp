import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, Point, RectangleElement } from "../types";
import { rotatePoint } from "../transform";

export function drawRectangle(
  el: RectangleElement,
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
) {
  const { x, y, width, height, angle } = el;

  ctx.save();

  const cx = x + width / 2;
  const cy = y + height / 2;

  if (angle !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  rc.rectangle(x, y, width, height, {
    stroke: el.stroke,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
    fill: el.fill || undefined,
    fillStyle: el.fillStyle,
    bowing: el.bowing,
    seed: el.seed,
    strokeLineDash: undefined
  });

  ctx.restore();
}

export function rectangleContainsPoint(
  el: RectangleElement,
  point: Point,
): boolean {
  const { x, y, width, height } = el;
  const left = x;
  const right = x + width;
  const top = y;
  const bottom = y + height;

  const minX = Math.min(left, right);
  const maxX = Math.max(left, right);
  const minY = Math.min(top, bottom);
  const maxY = Math.max(top, bottom);

  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  );
}

export function getRectangleBounds(el: RectangleElement): Bounds {
  const { x, y, width, height, angle } = el;
  if (angle === 0) return getRectangleLocalBounds(el);

  const cx = x + width / 2;
  const cy = y + height / 2;
  const center = { x: cx, y: cy };

  const corners: Point[] = [
    { x: x, y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height },
    { x: x, y: y + height },
  ];

  const rotatedCorners = corners.map((corner) =>
    rotatePoint(corner, center, angle),
  );
  const xs = rotatedCorners.map((p) => p.x);
  const ys = rotatedCorners.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function getRectangleLocalBounds(el: RectangleElement): Bounds {
  const { x, y, width, height } = el;
  return { x, y, width, height };
}
