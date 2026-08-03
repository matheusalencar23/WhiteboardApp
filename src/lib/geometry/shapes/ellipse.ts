import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, EllipseElement, Point } from "../types";
import { degreesToRadians } from "../transform";

export function drawEllipse(
  el: EllipseElement,
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
) {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;

  ctx.save();

  if (el.angle !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate(degreesToRadians(el.angle));
    ctx.translate(-cx, -cy);
  }

  rc.ellipse(el.x, el.y, el.width, el.height, {
    stroke: el.stroke,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
    bowing: el.bowing,
    seed: el.seed,
    fill: el.fill || undefined,
    fillStyle: el.fillStyle,
  });

  ctx.restore();
}

/**
 * Usamos a equação:
 * ((px - cx)^2 / rx^2 + (py - cy)^2 / ry^2) <= 1
 * para validar se o ponto está dentro da elipse
 * considerando que:
 * px é a coordedada x do ponto a ser testado
 * py é a coordedada y do ponto a ser testado
 * cx é a coordedada x do centro da elipse
 * cy é a coordedada y do centro da elipse
 * rx é comprimento do semieixo horiozontal
 * ry é comprimento do semieixo vertical
 */
export function ellipseContainsPoint(
  el: EllipseElement,
  point: Point,
): boolean {
  const { x, y, width, height } = el;

  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = Math.abs(el.width) / 2;
  const ry = Math.abs(el.height) / 2;

  if (rx === 0 || ry === 0) return false;

  const normalizedX = (point.x - cx) / rx;
  const normalizedY = (point.y - cy) / ry;

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

export function getEllipseGeometry(el: EllipseElement): Bounds {
  return { x: el.x, y: el.y, width: el.width, height: el.height };
}

/**
 * Calcula a caixa envolvente alinhada aos eixos (AABB - Axis-Aligned Bounding Box)
 * de uma elipse rotacionada.
 *
 * O cálculo determina a extensão máxima horizontal (`halfWidth`) e vertical (`halfHeight`)
 * a partir do centro da elipse após a aplicação de um ângulo de rotação.
 *
 * Utiliza a identidade trigonométrica derivada do cálculo do ponto extremo da elipse:
 * - halfWidth  = sqrt((a * cos(phi))^2 + (b * sin(phi))^2)
 * - halfHeight = sqrt((a * sin(phi))^2 + (b * cos(phi))^2)
 */
export function getEllipseBounds(el: EllipseElement): Bounds {
  const geometryBounds = getEllipseGeometry(el);
  if (el.angle === 0) return geometryBounds;

  const { x, y, width, height } = el;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = Math.abs(el.width) / 2;
  const ry = Math.abs(el.height) / 2;

  const rad = degreesToRadians(el.angle);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const halfWidth = Math.sqrt((rx * cos) ** 2 + (ry * sin) ** 2);
  const halfHeight = Math.sqrt((rx * sin) ** 2 + (ry * cos) ** 2);

  return {
    x: cx - halfWidth,
    y: cy - halfHeight,
    width: halfWidth * 2,
    height: halfHeight * 2,
  };
}
