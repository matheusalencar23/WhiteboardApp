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

export function screenPointToLocalSpace(
  point: Point,
  bounds: Bounds,
  angle: number,
) {
  if (angle === 0) return point;

  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;

  const matrix = new DOMMatrix()
    .translate(cx, cy)
    .rotate(angle)
    .translate(-cx, -cy)
    .inverse();

  const local = matrix.transformPoint(new DOMPoint(point.x, point.y));
  return { x: local.x, y: local.y };
}

export function getAnchorLocalPoint(bounds: Bounds, handle: HandleType): Point {
  const { x, y, width, height } = bounds;
  switch (handle) {
    case "se":
      return { x, y };
    case "s":
      return { x: x + width / 2, y };
    case "sw":
      return { x: x + width, y };
    case "e":
      return { x, y: y + height / 2 };
    case "w":
      return { x: x + width, y: y + height / 2 };
    case "ne":
      return { x, y: y + height };
    case "n":
      return { x: x + width / 2, y: y + height };
    case "nw":
      return { x: x + width, y: y + height };
    default:
      return { x: x + width / 2, y: y + height / 2 };
  }
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

export function calculateResize(
  element: IElement,
  handle: HandleType,
  mouse: Point,
): Bounds {
  const angle = element.angle || 0;
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const uX = { x: cos, y: sin };
  const uY = { x: -sin, y: cos };

  const cX = element.x + element.width / 2;
  const cY = element.y + element.height / 2; // fix: era element.x/width

  const dx = mouse.x - cX;
  const dy = mouse.y - cY;
  const projX = dx * uX.x + dy * uX.y;
  const projY = dx * uY.x + dy * uY.y;

  const halfWidth = element.width / 2;
  const halfHeight = element.height / 2;

  let rawWidth = element.width;
  let rawHeight = element.height;

  let anchorSignX = 0;
  let anchorSignY = 0;

  if (handle.includes("e")) {
    rawWidth = projX + halfWidth;
    anchorSignX = -1;
  } else if (handle.includes("w")) {
    rawWidth = halfWidth - projX; // fix: era halfHeight
    anchorSignX = 1;
  }

  if (handle.includes("s")) {
    rawHeight = projY + halfHeight;
    anchorSignY = -1;
  } else if (handle.includes("n")) {
    rawHeight = halfHeight - projY;
    anchorSignY = 1;
  }

  const anchorGlobalX =
    cX + anchorSignX * halfWidth * uX.x + anchorSignY * halfHeight * uY.x;
  const anchorGlobalY =
    cY + anchorSignX * halfWidth * uX.y + anchorSignY * halfHeight * uY.y;

  const finalWidth = Math.abs(rawWidth);
  const finalHeight = Math.abs(rawHeight);

  const dirX = rawWidth < 0 ? -anchorSignX : anchorSignX;
  const dirY = rawHeight < 0 ? -anchorSignY : anchorSignY;

  const newCx =
    anchorGlobalX -
    dirX * (finalWidth / 2) * uX.x -
    dirY * (finalHeight / 2) * uY.x;
  const newCy =
    anchorGlobalY -
    dirX * (finalWidth / 2) * uX.y -
    dirY * (finalHeight / 2) * uY.y;

  return {
    x: newCx - finalWidth / 2,
    y: newCy - finalHeight / 2,
    width: finalWidth,
    height: finalHeight,
  };
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
