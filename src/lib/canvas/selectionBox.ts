import type { Bounds } from "../geometry/types";

/**
 * Desenha a caixa tracejada + 8 handles de resize + alça de rotação em
 * torno de `bounds`. Funciona tanto para seleção única (bounds = bounds
 * LOCAL do elemento, angle = ângulo dele) quanto para grupo (bounds =
 * bounding box do grupo, angle = 0, já que grupos não rotacionam como
 * unidade).
 *
 * Quando angle !== 0, a rotação é aplicada ao redor do centro de
 * `bounds` antes de desenhar — por isso os cálculos de boxX/boxY/etc
 * abaixo podem ser feitos sempre "sem rotação": o ctx já está rotacionado
 * quando eles rodam.
 */
export function drawSelectionHandles(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  bounds: Bounds,
  angle: number = 0,
  padding: number = 8,
) {
  const { x, y, width, height } = bounds;
  const minX = Math.min(x, x + width);
  const maxX = Math.max(x, x + width);
  const minY = Math.min(y, y + height);
  const maxY = Math.max(y, y + height);

  const cx = minX + (maxX - minX) / 2;
  const cy = minY + (maxY - minY) / 2;

  ctx.save();

  if (angle !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  const pad = padding / zoom;
  const boxX = minX - pad;
  const boxY = minY - pad;
  const boxWidth = maxX - minX + pad * 2;
  const boxHeight = maxY - minY + pad * 2;

  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1.5 / zoom;
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

export function drawSubSelectionBox(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  bounds: Bounds,
  angle: number = 0,
) {
  const { x, y, width, height } = bounds;
  const cx = x + width / 2;
  const cy = y + height / 2;

  const padding = 4 / zoom;
  const boxWidth = Math.abs(width) + padding * 2;
  const boxHeight = Math.abs(height) + padding * 2;

  const left = -boxWidth / 2;
  const top = -boxHeight / 2;

  ctx.save();

  ctx.translate(cx, cy);
  ctx.rotate((angle * Math.PI) / 180);

  ctx.strokeStyle = "rgba(59, 130, 246, 0.7)";
  ctx.lineWidth = 1.5 / zoom;
  ctx.setLineDash([3 / zoom, 3 / zoom]);
  ctx.strokeRect(left, top, boxWidth, boxHeight);
  ctx.setLineDash([]);

  ctx.restore();
}
