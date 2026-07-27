import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Tool } from "../canvas/types";

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
  seed?: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type HandleType = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export interface IElement {
  id: string;
  type: Exclude<Tool, "selection"> | null;
  stroke: string;
  strokeWidth: number;
  roughness: number;
  bowing: number;
  seed: number;
  properties: Properties;

  draw(_rc: RoughCanvas): void;
  containsPoint(point: Point): boolean;
  getBounds(): Bounds;
}
