import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, CanvasElement, Point } from "./types";
import {
  drawRectangle,
  getRectangleBounds,
  getRectangleGeometry,
  rectangleContainsPoint,
} from "./shapes/rectangle";
import {
  drawEllipse,
  ellipseContainsPoint,
  getEllipseBounds,
  getEllipseGeometry,
} from "./shapes/ellipse";
import {
  drawLine,
  getLineBounds,
  getLineGeometry,
  lineContainsPoint,
} from "./shapes/line";

export const MIN_DRAW_SIZE = 2;

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

export function getElementGeometry(el: CanvasElement): Bounds {
  switch (el.type) {
    case "rectangle":
      return getRectangleGeometry(el);
    case "ellipse":
      return getEllipseGeometry(el);
    case "line":
      return getLineGeometry(el);
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

/**
 * Verdadeiro se a forma é pequena demais para ter sido um desenho
 * intencional (clique sem arraste, ou arraste de 1-2px).
 *
 * Usa a geometria (largura/altura do bounding box), não uma medida
 * específica por tipo — o que também resolve, de graça, o caso de uma
 * linha com um único ponto: sua geometria já é {width: 0, height: 0},
 * então cai no mesmo critério, sem precisar de tratamento especial.
 *
 * Trade-off aceito: uma linha diagonal muito curta (ex.: dx=1.9, dy=1.9)
 * pode ser considerada vazia mesmo tendo ~2.7px de comprimento real,
 * porque width e height são avaliados isoladamente. Na prática, essa
 * diferença é imperceptível para o usuário — não vale a complexidade de
 * um critério por tipo só para esse caso extremo.
 */
export function isElementEmpty(el: CanvasElement): boolean {
  const geometry = getElementGeometry(el);
  return (
    Math.abs(geometry.width) < MIN_DRAW_SIZE &&
    Math.abs(geometry.height) < MIN_DRAW_SIZE
  );
}
