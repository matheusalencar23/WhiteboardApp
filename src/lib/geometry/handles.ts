import type { Bounds, HandleType, Point } from "./types";
import { screenPointToLocalSpace } from "./coordinates";

export function getHandleAtPoint(
  point: Point,
  bounds: Bounds,
  zoom: number,
  angle: number = 0,
): HandleType | null {
  const padding = 8 / zoom;
  const handleSize = 10 / zoom;
  const halfHandle = handleSize / 2;

  const testPoint = screenPointToLocalSpace(point, bounds, angle);

  const boxX = bounds.x - padding;
  const boxY = bounds.y - padding;
  const boxWidth = bounds.width + padding * 2;
  const boxHeight = bounds.height + padding * 2;

  const handles: Record<HandleType, Point> = {
    nw: { x: boxX, y: boxY },
    n: { x: boxX + boxWidth / 2, y: boxY },
    ne: { x: boxX + boxWidth, y: boxY },
    e: { x: boxX + boxWidth, y: boxY + boxHeight / 2 },
    se: { x: boxX + boxWidth, y: boxY + boxHeight },
    s: { x: boxX + boxWidth / 2, y: boxY + boxHeight },
    sw: { x: boxX, y: boxY + boxHeight },
    w: { x: boxX, y: boxY + boxHeight / 2 },
    rotation: {
      x: boxX + boxWidth / 2,
      y: boxY - 25 / zoom,
    },
  };

  for (const [type, h] of Object.entries(handles)) {
    if (
      testPoint.x >= h.x - halfHandle &&
      testPoint.x <= h.x + halfHandle &&
      testPoint.y >= h.y - halfHandle &&
      testPoint.y <= h.y + halfHandle
    ) {
      return type as HandleType;
    }
  }

  return null;
}

export function calculateAxisAlignedResizeBounds(
  initialBounds: Bounds,
  handle: HandleType,
  currentPoint: Point,
) {
  let { x, y, width, height } = initialBounds;

  const right = x + width;
  const bottom = y + height;

  switch (handle) {
    case "se":
      width = currentPoint.x - x;
      height = currentPoint.y - y;
      break;
    case "e":
      width = currentPoint.x - x;
      break;
    case "s":
      height = currentPoint.y - y;
      break;
    case "nw":
      x = currentPoint.x;
      y = currentPoint.y;
      width = right - currentPoint.x;
      height = bottom - currentPoint.y;
      break;
    case "n":
      y = currentPoint.y;
      height = bottom - currentPoint.y;
      break;
    case "w":
      x = currentPoint.x;
      width = right - currentPoint.x;
      break;
    case "ne":
      y = currentPoint.y;
      width = currentPoint.x - x;
      height = bottom - currentPoint.y;
      break;
    case "sw":
      x = currentPoint.x;
      width = right - currentPoint.x;
      height = currentPoint.y - y;
      break;
  }

  return { x, y, width, height };
}