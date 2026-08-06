import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, LineElement, Point } from "../types";
import {
  getLinearBounds,
  getLinearGeometry,
  linearContainsPoint,
  toWorldPoints,
} from "./linear";
import { degreesToRadians } from "../transform";

export function drawLine(
  el: LineElement,
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
) {
  const geometryBounds = getLinearGeometry(el);
  const cx = geometryBounds.x + geometryBounds.width / 2;
  const cy = geometryBounds.y + geometryBounds.height / 2;

  ctx.save();

  if (el.angle !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate(degreesToRadians(el.angle));
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
  return getLinearGeometry(el);
}

export function lineContainsPoint(el: LineElement, point: Point): boolean {
  return linearContainsPoint(el, point);
}

export function getLineBounds(el: LineElement): Bounds {
  return getLinearBounds(el);
}
