import { ElementFactory } from "./elementFactory";
import type { Bounds, HandleType, IElement, Point } from "./types";

export function screenToWorld(
  screenX: number,
  screenY: number,
  zoom: number,
  pan: Point,
): Point {
  return {
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom,
  };
}

export function getGroupBounds(elements: IElement[]): Bounds | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    const bounds = el.getBounds();
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function getHandleAtPoint(
  point: Point,
  bounds: Bounds,
  zoom: number,
): HandleType | null {
  const padding = 8 / zoom;
  const handleSize = 10 / zoom;
  const halfHandle = handleSize / 2;

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
      point.x >= h.x - halfHandle &&
      point.x <= h.x + halfHandle &&
      point.y >= h.y - halfHandle &&
      point.y <= h.y + halfHandle
    ) {
      return type as HandleType;
    }
  }

  return null;
}

export function calculateResizeBounds(
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

export function moveElements(
  elements: IElement[],
  deltaX: number,
  deltaY: number,
): IElement[] {
  return elements.map((el) => {
    const bounds = el.getBounds();
    return ElementFactory.create(
      el.type!,
      bounds.x + deltaX,
      bounds.y + deltaY,
      bounds.width,
      bounds.height,
      {
        ...el.properties,
      },
    );
  });
}

export function pointInBounds(point: Point, bounds: Bounds): boolean {
  const left = bounds.x;
  const right = bounds.x + bounds.width;
  const top = bounds.y;
  const bottom = bounds.y + bounds.height;

  const minX = Math.min(left, right);
  const maxX = Math.max(left, right);
  const minY = Math.min(top, bottom);
  const maxY = Math.max(top, bottom);

  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  );
}

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
