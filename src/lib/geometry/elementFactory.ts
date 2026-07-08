import type { Tool } from "../canvas/types";
import { Rectangle } from "./rectangle";

export class ElementFactory {
  static create(tool: Tool, x: number, y: number) {
    switch (tool) {
      case "rectangle":
        return new Rectangle(x, y, 0, 0);
      default:
        throw new Error(`Ferramenta ${tool} não suportada`);
    }
  }
}
