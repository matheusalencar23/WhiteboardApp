import { nanoid } from "nanoid";
import type { DrawingTool } from "../canvas/types";
import type { CanvasElement, EllipseElement, RectangleElement } from "./types";

type NewElementInput = Partial<Omit<CanvasElement, "id" | "type">> & {
  x: number;
  y: number;
};

const DEFAULTS = {
  width: 0,
  height: 0,
  angle: 0,
  stroke: "#000000",
  strokeWidth: 2,
  roughness: 1.5,
  bowing: 1,
  fill: null,
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
      return { ...base, type: "rectangle" } as RectangleElement;
    case "ellipse":
      return { ...base, type: "ellipse" } as EllipseElement;
  }
}

export function cloneElement<T extends CanvasElement>(
  el: T,
  overrides: Partial<Omit<T, "id" | "type">>,
): T {
  return { ...el, ...overrides };
}
