import type { Bounds, HandleType, IElement, Point } from "./types";

export function calculateRotatedResize(
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
