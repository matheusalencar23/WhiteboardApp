import rough from "roughjs";
import type { CanvasElement, Point } from "../geometry/types";
import { applyCameraTransform, type Camera } from "./camera";
import { drawGrid } from "./grid";
import { drawElement } from "../geometry/elementOperations";
import { useCanvasStore } from "../../store/useCanvasStore";

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

  const { selectionBox } = useCanvasStore.getState();
  if (selectionBox) {
    drawSelectionRect(ctx, camera.zoom, selectionBox);
  }

  ctx.restore();
}

function drawSelectionRect(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  box: { start: Point; current: Point },
) {
  const minX = Math.min(box.start.x, box.current.x);
  const maxX = Math.max(box.start.x, box.current.x);
  const minY = Math.min(box.start.y, box.current.y);
  const maxY = Math.max(box.start.y, box.current.y);

  ctx.save();
  ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
  ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
  ctx.lineWidth = 1 / zoom;
  ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  ctx.restore();
}
