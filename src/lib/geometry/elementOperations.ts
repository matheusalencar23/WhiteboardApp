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
  }
}

export function elementContainsPoint(el: CanvasElement, point: Point): boolean {
  switch (el.type) {
    case "rectangle":
      return rectangleContainsPoint(el, point);
    case "ellipse":
      return ellipseContainsPoint(el, point);
  }
}

export function getElementBounds(el: CanvasElement): Bounds {
  switch (el.type) {
    case "rectangle":
      return getRectangleBounds(el);
    case "ellipse":
      return getEllipseBounds(el);
  }
}

export function getElementLocalBounds(el: CanvasElement): Bounds {
  switch (el.type) {
    case "rectangle":
      return getRectangleLocalBounds(el);
    case "ellipse":
      return getEllipseLocalBounds(el);
  }
}
