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
import { drawLine, getLineBounds, getLineGeometry, lineContainsPoint } from "./shapes/line";

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
