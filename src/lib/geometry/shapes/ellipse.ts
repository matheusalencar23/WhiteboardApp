import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, EllipseElement, Point } from "../types";

export function drawEllipse(
  el: EllipseElement,
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

  rc.ellipse(cx, cy, Math.abs(width), Math.abs(height), {
    stroke: el.stroke,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
    fill: el.fill || undefined,
    fillStyle: el.fillStyle,
    bowing: el.bowing,
    seed: el.seed,
  });

  ctx.restore();
}

export function ellipseContainsPoint(
  el: EllipseElement,
  point: Point,
): boolean {
  const { x, y, width, height } = el;

  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = Math.abs(width) / 2;
  const ry = Math.abs(height) / 2;

  if (rx === 0 || ry === 0) return false;

  const normalizedX = (point.x - cx) / rx;
  const normalizedY = (point.y - cy) / ry;

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

export function getEllipseBounds(el: EllipseElement): Bounds {
  const { x, y, width, height, angle } = el;

  if (angle === 0) {
    return getEllipseLocalBounds(el);
  }

  const cx = x + width / 2;
  const cy = y + height / 2;

  const a = Math.abs(width) / 2;
  const b = Math.abs(height) / 2;

  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const halfWidth = Math.sqrt((a * cos) ** 2 + (b * sin) ** 2);
  const halfHeight = Math.sqrt((a * sin) ** 2 + (b * cos) ** 2);

  return {
    x: cx - halfWidth,
    y: cy - halfHeight,
    width: halfWidth * 2,
    height: halfHeight * 2,
  };
}

export function getEllipseLocalBounds(el: EllipseElement): Bounds {
  const { x, y, width, height } = el;
  return { x, y, width, height };
}
