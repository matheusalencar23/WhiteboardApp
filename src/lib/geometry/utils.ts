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

    const elMinX = Math.min(bounds.x, bounds.x + bounds.width);
    const elMaxX = Math.max(bounds.x, bounds.x + bounds.width);
    const elMinY = Math.min(bounds.y, bounds.y + bounds.height);
    const elMaxY = Math.max(bounds.y, bounds.y + bounds.height);

    if (elMinX < minX) minX = elMinX;
    if (elMinY < minY) minY = elMinY;
    if (elMaxX > maxX) maxX = elMaxX;
    if (elMaxY > maxY) maxY = elMaxY;
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
  }

  return { x, y, width, height };
}

export function getBoundsFromPoints(start: Point, current: Point): Bounds {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);

  return { x, y, width, height };
}
