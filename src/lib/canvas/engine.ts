import rough from "roughjs";
import type { CanvasElement } from "../geometry/types";
import { applyCameraTransform, type Camera } from "./camera";
import { drawGrid } from "./grid";
import { drawElement } from "../geometry/elementOperations";

/**
 * Redesenha o canvas inteiro a cada frame relevante, sem dirty-checking.
 * Ordem: grid -> elementos (ainda não implementado) -> seleção (idem).
 * O parâmetro `elements` já existe na assinatura para não precisar
 * mudar a chamada em Canvas.tsx quando o desenho de formas for adicionado.
 */
export function render(
  canvas: HTMLCanvasElement,
  elements: CanvasElement[],
  camera: Camera,
) {
  const ctx = canvas.getContext("2d")!;
  const dpr = window.devicePixelRatio || 1;

  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(dpr, dpr);

  ctx.save();
  applyCameraTransform(ctx, camera);

  drawGrid(ctx, width, height, camera);

  const rc = rough.canvas(canvas);
  elements.forEach((el) => drawElement(el, rc, ctx));

  ctx.restore();
}
