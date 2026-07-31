export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type HandleType =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "rotation";

export interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  stroke: string;
  strokeWidth: number;
  roughness: number;
  bowing: number;
  seed: number;
}

export interface RectangleElement extends BaseElement {
  type: "rectangle";
  fill: string;
  fillStyle: string;
}

export interface EllipseElement extends BaseElement {
  type: "ellipse";
  fill: string;
  fillStyle: string;
}

export type CanvasElement = RectangleElement | EllipseElement;

export type ElementOverrides = Partial<Omit<BaseElement, "id">> &
  Partial<Pick<RectangleElement | EllipseElement, "fill" | "fillStyle">>;
