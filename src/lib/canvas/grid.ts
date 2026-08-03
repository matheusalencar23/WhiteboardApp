import type { Camera } from "./camera";

const GRID_SIZE = 40;
const GRID_COLOR = "#e2e8f0";

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: Camera,
) {
  ctx.save();
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5 / camera.zoom;

  const startX =
    Math.floor(-camera.pan.x / camera.zoom / GRID_SIZE) * GRID_SIZE;
  const startY =
    Math.floor(-camera.pan.y / camera.zoom / GRID_SIZE) * GRID_SIZE;
  const endX = startX + width / camera.zoom + GRID_SIZE;
  const endY = startY + height / camera.zoom + GRID_SIZE;
  const centerX = -camera.pan.x / camera.zoom + width / (2 * camera.zoom);
  const centerGridX = Math.round(centerX / GRID_SIZE) * GRID_SIZE;
  const centerY = -camera.pan.y / camera.zoom + height / (2 * camera.zoom);
  const centerGridY = Math.round(centerY / GRID_SIZE) * GRID_SIZE;

  for (let x = startX; x < endX; x += GRID_SIZE) {
    ctx.lineWidth = x === centerGridX ? 2 / camera.zoom : 0.5 / camera.zoom;
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }

  for (let y = startY; y < endY; y += GRID_SIZE) {
    ctx.lineWidth = y === centerGridY ? 2 / camera.zoom : 0.5 / camera.zoom;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }

  ctx.restore();
}
