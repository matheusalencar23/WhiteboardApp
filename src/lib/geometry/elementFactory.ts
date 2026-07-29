import type { DrawingTool } from "../canvas/types";
import { Ellipse } from "./ellipse";
import { Rectangle } from "./rectangle";
import type { Properties } from "./types";

export class ElementFactory {
  static create(
    tool: DrawingTool,
    x: number,
    y: number,
    width: number = 0,
    height: number = 0,
    props: Properties = {},
  ) {
    switch (tool) {
      case "rectangle":
        return new Rectangle(x, y, width, height, props);
      case "ellipse":
        return new Ellipse(x, y, width, height, props);
    }
  }
}
