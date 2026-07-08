import rough from "roughjs";
import type { IElement, Point } from "../geometry/types";

export function render(
  canvas: HTMLCanvasElement,
  elements: IElement[],
  zoom: number,
  pan: Point,
) {
  const ctx = canvas.getContext("2d")!;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.scale(zoom, zoom);

  const rc = rough.canvas(canvas);

  elements.forEach((el) => el.draw(rc));

  ctx.restore();
}
