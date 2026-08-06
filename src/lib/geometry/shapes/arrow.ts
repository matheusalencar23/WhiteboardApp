import type { RoughCanvas } from "roughjs/bin/canvas";
import type { ArrowElement, Bounds, Point } from "../types";
import {
  getLinearBounds,
  getLinearGeometry,
  linearContainsPoint,
  toWorldPoints,
} from "./linear";
import { degreesToRadians } from "../transform";

const ARROWHEAD_LENGTH = 14;
const ARROWHEAD_SPREAD = Math.PI / 7;

export function drawArrow(
  el: ArrowElement,
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
  const style = {
    stroke: el.stroke,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
    bowing: el.bowing,
    seed: el.seed,
  };

  rc.linearPath(
    worldPoints.map((p) => [p.x, p.y]),
    style,
  );

  if (worldPoints.length >= 2) {
    if (el.endArrowhead === "triangle") {
      drawArrowhead(
        rc,
        worldPoints[worldPoints.length - 2],
        worldPoints[worldPoints.length - 1],
        style,
      );
    }

    if (el.startArrowhead === "triangle") {
      drawArrowhead(rc, worldPoints[1], worldPoints[0], style);
    }
  }

  ctx.restore();
}

function drawArrowhead(rc: RoughCanvas, from: Point, to: Point, style: object) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  const leftWing: Point = {
    x: to.x - ARROWHEAD_LENGTH * Math.cos(angle - ARROWHEAD_SPREAD),
    y: to.y - ARROWHEAD_LENGTH * Math.sin(angle - ARROWHEAD_SPREAD),
  };

  const rightWing: Point = {
    x: to.x - ARROWHEAD_LENGTH * Math.cos(angle + ARROWHEAD_SPREAD),
    y: to.y - ARROWHEAD_LENGTH * Math.sin(angle + ARROWHEAD_SPREAD),
  };

  rc.linearPath(
    [
      [leftWing.x, leftWing.y],
      [to.x, to.y],
      [rightWing.x, rightWing.y],
    ],
    style,
  );
}

export function getArrowGeometry(el: ArrowElement): Bounds {
  return getLinearGeometry(el);
}

export function arrowContainsPoint(el: ArrowElement, point: Point): boolean {
  return linearContainsPoint(el, point);
}

export function getArrowBounds(el: ArrowElement): Bounds {
  return getLinearBounds(el);
}
