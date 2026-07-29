import type { Point } from "./types";

export function calculateRotationAngle(
  centerPoint: Point,
  currentMousePoint: Point,
): number {
  const radians = Math.atan2(
    currentMousePoint.y - centerPoint.y,
    currentMousePoint.x - centerPoint.x,
  );

  let degrees = (radians * 180) / Math.PI + 90;
  if (degrees < 0) degrees += 360;

  return Math.round(degrees);
}

export function rotatePoint(
  point: Point,
  center: Point,
  angleInDegrees: number,
): Point {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  const cos = Math.cos(angleInRadians);
  const sin = Math.sin(angleInRadians);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}
