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
  angle?: number;
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

export interface IElement {
  id: string;
  type: Exclude<Tool, "selection"> | null;
  stroke: string;
  strokeWidth: number;
  roughness: number;
  bowing: number;
  seed: number;
  angle: number;
  properties: Properties;

  draw(_rc: RoughCanvas, _ctx: CanvasRenderingContext2D): void;
  containsPoint(point: Point): boolean;
  getBounds(): Bounds;
}
