import { nanoid } from "nanoid";
import type { DrawingTool } from "../canvas/types";
import type {
  CanvasElement,
  EllipseElement,
  LineElement,
  Point,
  RectangleElement,
} from "./types";

type NewElementInput = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  angle?: number;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  bowing?: number;
  seed?: number;
  fill?: string | null;
  fillStyle?: string;
  points?: Point[];
};

const DEFAULTS = {
  width: 0,
  height: 0,
  angle: 0,
  stroke: "#000000",
  strokeWidth: 2,
  roughness: 1.5,
  bowing: 1,
  fill: null as string | null,
  fillStyle: "hachure",
};

export function createElement(
  tool: DrawingTool,
  input: NewElementInput,
): CanvasElement {
  const base = {
    id: nanoid(),
    seed: Math.floor(Math.random() * 100000),
    ...DEFAULTS,
    ...input,
  };

  switch (tool) {
    case "rectangle":
      return {
        id: base.id,
        x: base.x,
        y: base.y,
        width: base.width,
        height: base.height,
        angle: base.angle,
        stroke: base.stroke,
        strokeWidth: base.strokeWidth,
        roughness: base.roughness,
        bowing: base.bowing,
        seed: base.seed,
        fill: base.fill,
        fillStyle: base.fillStyle,
        type: "rectangle",
      } satisfies RectangleElement;
    case "ellipse":
      return {
        id: base.id,
        x: base.x,
        y: base.y,
        width: base.width,
        height: base.height,
        angle: base.angle,
        stroke: base.stroke,
        strokeWidth: base.strokeWidth,
        roughness: base.roughness,
        bowing: base.bowing,
        seed: base.seed,
        fill: base.fill,
        fillStyle: base.fillStyle,
        type: "ellipse",
      } satisfies EllipseElement;
    case "line":
      return {
        id: base.id,
        x: base.x,
        y: base.y,
        angle: base.angle,
        stroke: base.stroke,
        strokeWidth: base.strokeWidth,
        roughness: base.roughness,
        bowing: base.bowing,
        seed: base.seed,
        points: input.points ?? [{ x: 0, y: 0 }],
        type: "line",
      } as LineElement;
  }
}

export function cloneElement<T extends CanvasElement>(
  el: T,
  overrides: Partial<Omit<T, "id" | "type">>,
): T {
  return { ...el, ...overrides };
}
