import rough from "roughjs";
import type { Element } from "./element";

export function render(canvas: HTMLCanvasElement, elements: Element[]) {
  const ctx = canvas.getContext("2d")!;
  const rc = rough.canvas(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  elements.forEach((el) => el.draw(rc));
}
