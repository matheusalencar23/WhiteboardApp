import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, CanvasElement, Point } from "./types";
import {
  drawRectangle,
  getRectangleBounds,
  getRectangleLocalBounds,
  rectangleContainsPoint,
} from "./shapes/rectangle";
import {
  drawEllipse,
  ellipseContainsPoint,
  getEllipseBounds,
  getEllipseLocalBounds,
} from "./shapes/ellipse";
import {
  drawLine,
  getLineBounds,
  getLineLocalBounds,
  lineContainsPoint,
} from "./shapes/line";
import { cloneElement } from "./createElement";

export function drawElement(
  el: CanvasElement,
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
) {
  switch (el.type) {
    case "rectangle":
      return drawRectangle(el, rc, ctx);
    case "ellipse":
      return drawEllipse(el, rc, ctx);
    case "line":
      return drawLine(el, rc, ctx);
  }
}

export function elementContainsPoint(el: CanvasElement, point: Point): boolean {
  switch (el.type) {
    case "rectangle":
      return rectangleContainsPoint(el, point);
    case "ellipse":
      return ellipseContainsPoint(el, point);
    case "line":
      return lineContainsPoint(el, point);
  }
}

export function getElementBounds(el: CanvasElement): Bounds {
  switch (el.type) {
    case "rectangle":
      return getRectangleBounds(el);
    case "ellipse":
      return getEllipseBounds(el);
    case "line":
      return getLineBounds(el);
  }
}

export function getElementLocalBounds(el: CanvasElement): Bounds {
  switch (el.type) {
    case "rectangle":
      return getRectangleLocalBounds(el);
    case "ellipse":
      return getEllipseLocalBounds(el);
    case "line":
      return getLineLocalBounds(el);
  }
}

/**
 * Aplica uma transformação de bounds (mudança de posição/tamanho) a um
 * elemento, de forma específica ao tipo:
 * - Formas-caixa: bounds novos viram x/y/width/height diretamente.
 * - Formas lineares: os pontos são escalados proporcionalmente à mudança
 *   de bounds, mantendo suas posições relativas dentro da forma.
 */
export function applyBoundsToElement(
  el: CanvasElement,
  oldLocalBounds: Bounds,
  newLocalBounds: Bounds,
): CanvasElement {
  if (el.type === "line") {
    const scaleX = newLocalBounds.width / (oldLocalBounds.width || 1);
    const scaleY = newLocalBounds.height / (oldLocalBounds.height || 1);

    const worldPoints = el.points.map((p) => ({
      x: el.x + p.x,
      y: el.y + p.y,
    }));

    const mapped = worldPoints.map((p) => ({
      x: newLocalBounds.x + (p.x - oldLocalBounds.x) * scaleX,
      y: newLocalBounds.y + (p.y - oldLocalBounds.y) * scaleY,
    }));

    const originX = mapped[0].x;
    const originY = mapped[0].y;

    return cloneElement(el, {
      x: originX,
      y: originY,
      points: mapped.map((p) => ({ x: p.x - originX, y: p.y - originY })),
    });
  }

  return cloneElement(el, {
    x: newLocalBounds.x,
    y: newLocalBounds.y,
    width: newLocalBounds.width,
    height: newLocalBounds.height,
  });
}
