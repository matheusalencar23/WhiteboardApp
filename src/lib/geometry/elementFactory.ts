import type { Tool } from "../canvas/types";
import { Ellipse } from "./ellipse";
import { Rectangle } from "./rectangle";
import type { Properties } from "./types";

export class ElementFactory {
  static create(
    tool: Tool,
    x: number,
    y: number,
    width: number = 0,
    height: number = 0,
    props: Properties = {},
  ) {
    console.log(props)
    switch (tool) {
      case "rectangle":
        return new Rectangle(x, y, width, height, props);
      case "ellipse":
        return new Ellipse(x, y, width, height, props);
      default:
        throw new Error(`Ferramenta ${tool} não suportada`);
    }
  }
}
