import type { Point } from "../geometry/types";

export function drawSelectionRect(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  box: { start: Point; current: Point },
) {
  const minX = Math.min(box.start.x, box.current.x);
  const maxX = Math.max(box.start.x, box.current.x);
  const minY = Math.min(box.start.y, box.current.y);
  const maxY = Math.max(box.start.y, box.current.y);

  ctx.save();

  ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
  ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
  ctx.lineWidth = 1 / zoom;

  ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  ctx.restore();
}
