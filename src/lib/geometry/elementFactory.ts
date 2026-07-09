import type { Tool } from "../canvas/types";
import { Rectangle } from "./rectangle";
import type { Properties } from "./types";

export class ElementFactory {
  static create(
    tool: Tool,
    x: number,
    y: number,
    width: number = 0,
    height: number = 0,
    props: Properties = {}
  ) {
    switch (tool) {
      case "rectangle":
        return new Rectangle(x, y, width, height, props);
      default:
        throw new Error(`Ferramenta ${tool} não suportada`);
    }
  }
}
