import type { RoughCanvas } from "roughjs/bin/canvas";

export interface Point {
  x: number;
  y: number;
}

export interface Properties {
  id?: string;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  fill?: string;
  fillStyle?: string;
  bowing?: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IElement {
  id: string;
  x: number;
  y: number;
  stroke: string;
  strokeWidth: number;
  roughness: number;
  bowing: number;
  seed: number;

  draw(_rc: RoughCanvas): void;
  containsPoint(point: Point): boolean;
  getBounds(): Bounds;
}
