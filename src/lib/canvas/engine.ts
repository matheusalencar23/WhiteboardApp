import rough from "roughjs";
import type { Bounds, IElement, Point } from "../geometry/types";
import { useCanvasStore } from "../../store/useCanvasStore";
import { getGroupBounds } from "../geometry/utils";

export function render(
  canvas: HTMLCanvasElement,
  elements: IElement[],
  zoom: number,
  pan: Point,
) {
  const ctx = canvas.getContext("2d")!;
  const dpr = window.devicePixelRatio || 1;

  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(dpr, dpr);

  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.scale(zoom, zoom);

  drawGrid(ctx, width, height, zoom, pan);

  const rc = rough.canvas(canvas);

  elements.forEach((el) => el.draw(rc, ctx));

  const { selectedElementIds, selectionBox } = useCanvasStore.getState();

  if (selectionBox) {
    drawSelectionContainer(ctx, zoom, selectionBox);
  }

  if (selectedElementIds && selectedElementIds.length > 0) {
    const selectedElements = elements.filter((el) =>
      selectedElementIds.includes(el.id),
    );

    if (selectedElementIds.length === 1) {
      drawGeometrySelectionBox(ctx, zoom, selectedElements[0]);
    } else {
      const groupBounds = getGroupBounds(selectedElements);

      if (groupBounds) {
        drawGeometryGroupSelectionBox(ctx, zoom, groupBounds);
      }

      selectedElements.forEach((el) =>
        drawGeometrySubSelectionBox(ctx, zoom, el),
      );
    }
  }

  ctx.restore();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  pan: Point,
) {
  ctx.save();

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 0.5 / zoom;

  const gridSize = 40;

  const startX = Math.floor(-pan.x / zoom / gridSize) * gridSize;
  const startY = Math.floor(-pan.y / zoom / gridSize) * gridSize;

  const endX = startX + width / zoom + gridSize;
  const endY = startY + height / zoom + gridSize;

  for (let x = startX; x < endX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }

  for (let y = startY; y < endY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawGeometryGroupSelectionBox(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  bounds: Bounds,
) {
  const { x, y, width, height } = bounds;
  const minX = Math.min(x, x + width);
  const maxX = Math.max(x, x + width);
  const minY = Math.min(y, y + height);
  const maxY = Math.max(y, y + height);

  ctx.save();

  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1.5 / zoom;

  const padding = 8 / zoom;
  const boxX = minX - padding;
  const boxY = minY - padding;
  const boxWidth = maxX - minX + padding * 2;
  const boxHeight = maxY - minY + padding * 2;

  ctx.setLineDash([4 / zoom, 4 / zoom]);
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
  ctx.setLineDash([]);

  const handleSize = 8 / zoom;
  const halfHandle = handleSize / 2;

  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 1.5 / zoom;

  const handlers = [
    { x: boxX, y: boxY },
    { x: boxX + boxWidth, y: boxY },
    { x: boxX + boxWidth, y: boxY + boxHeight },
    { x: boxX, y: boxY + boxHeight },
    { x: boxX + boxWidth / 2, y: boxY },
    { x: boxX + boxWidth, y: boxY + boxHeight / 2 },
    { x: boxX + boxWidth / 2, y: boxY + boxHeight },
    { x: boxX, y: boxY + boxHeight / 2 },
  ];

  handlers.forEach((handle) => {
    ctx.beginPath();
    ctx.rect(
      handle.x - halfHandle,
      handle.y - halfHandle,
      handleSize,
      handleSize,
    );
    ctx.fill();
    ctx.stroke();
  });

  const rotationOffset = 25 / zoom;
  const topCenterX = boxX + boxWidth / 2;
  const topCenterY = boxY;
  const rotationY = topCenterY - rotationOffset;

  ctx.beginPath();
  ctx.moveTo(topCenterX, topCenterY - halfHandle);
  ctx.lineTo(topCenterX, rotationY);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(topCenterX, rotationY, halfHandle, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawSelectionContainer(
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

function drawGeometrySelectionBox(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  el: IElement,
) {
  const { x, y, width, height, angle = 0 } = el;

  const cx = x + width / 2;
  const cy = y + height / 2;

  const padding = 8 / zoom;
  const boxWidth = Math.abs(width) + padding * 2;
  const boxHeight = Math.abs(height) + padding * 2;

  const left = -boxWidth / 2;
  const top = -boxHeight / 2;

  ctx.save();

  ctx.translate(cx, cy);
  ctx.rotate((angle * Math.PI) / 180);

  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1.5 / zoom;
  ctx.setLineDash([4 / zoom, 4 / zoom]);
  ctx.strokeRect(left, top, boxWidth, boxHeight);
  ctx.setLineDash([]);

  const handleSize = 8 / zoom;
  const halfHandle = handleSize / 2;

  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 1.5 / zoom;

  const handlers = [
    { x: left, y: top },
    { x: left + boxWidth, y: top },
    { x: left + boxWidth, y: top + boxHeight },
    { x: left, y: top + boxHeight },
    { x: left + boxWidth / 2, y: top },
    { x: left + boxWidth, y: top + boxHeight / 2 },
    { x: left + boxWidth / 2, y: top + boxHeight },
    { x: left, y: top + boxHeight / 2 },
  ];

  handlers.forEach((handle) => {
    ctx.beginPath();
    ctx.rect(
      handle.x - halfHandle,
      handle.y - halfHandle,
      handleSize,
      handleSize,
    );
    ctx.fill();
    ctx.stroke();
  });

  const rotationOffset = 25 / zoom;
  const topCenterX = left + boxWidth / 2;
  const topCenterY = top;
  const rotationY = topCenterY - rotationOffset;

  ctx.beginPath();
  ctx.moveTo(topCenterX, topCenterY - halfHandle);
  ctx.lineTo(topCenterX, rotationY);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(topCenterX, rotationY, halfHandle, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawGeometrySubSelectionBox(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  el: IElement,
) {
  const { x, y, width, height, angle = 0 } = el;

  const cx = x + width / 2;
  const cy = y + height / 2;

  const padding = 4 / zoom;
  const boxWidth = Math.abs(width) + padding * 2;
  const boxHeight = Math.abs(height) + padding * 2;

  const left = -boxWidth / 2;
  const top = -boxHeight / 2;

  ctx.save();

  // Aplica a rotação individual do elemento
  ctx.translate(cx, cy);
  ctx.rotate((angle * Math.PI) / 180);

  ctx.strokeStyle = "rgba(59, 130, 246, 0.7)";
  ctx.lineWidth = 1.5 / zoom;
  ctx.setLineDash([3 / zoom, 3 / zoom]);
  ctx.strokeRect(left, top, boxWidth, boxHeight);
  ctx.setLineDash([]);

  ctx.restore();
}
