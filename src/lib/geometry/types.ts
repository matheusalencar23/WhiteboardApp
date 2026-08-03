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

interface ElementBase {
  id: string;
  x: number;
  y: number;
  angle: number;
  stroke: string;
  strokeWidth: number;
  roughness: number;
  bowing: number;
  seed: number;
}

export interface RectangleElement extends ElementBase {
  type: "rectangle";
  width: number;
  height: number;
  fill: string | null;
  fillStyle: string;
}

export interface EllipseElement extends ElementBase {
  type: "ellipse";
  width: number;
  height: number;
  fill: string | null;
  fillStyle: string;
}

export interface LineElement extends ElementBase {
  type: "line";
  points: Point[];
}

export type CanvasElement = RectangleElement | EllipseElement | LineElement;
