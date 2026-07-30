import rough from "roughjs";
import type { IElement, Point } from "../geometry/types";
import { useCanvasStore } from "../../store/useCanvasStore";
import { getGroupBounds } from "../geometry/bounds";
import { drawGrid } from "./grid";
import { drawSelectionHandles, drawSubSelectionBox } from "./selectionBox";
import { drawSelectionRect } from "./selectionRect";

/**
 * Desenha o canvas inteiro do zero a cada frame (sem dirty-checking):
 * grid -> elementos -> caixa de seleção por arraste -> handles de
 * seleção. A ordem importa: cada camada é desenhada por cima da
 * anterior.
 *
 * Duas transformações de contexto se sobrepõem aqui:
 * 1. translate(pan) + scale(zoom): aplicada uma vez, no início, para
 *    que TUDO daqui pra baixo já seja desenhado em coordenadas de
 *    MUNDO — ou seja, o resto do código de desenho não precisa se
 *    preocupar com pan/zoom, só com x/y reais dos elementos.
 * 2. translate(centro) + rotate(angle) + translate(-centro): aplicada
 *    individualmente por elemento/seleção que tenha rotação, dentro de
 *    save()/restore() próprios, para não vazar a rotação para o que
 *    vem depois.
 */
export function render(
  canvas: HTMLCanvasElement,
  elements: IElement[],
  zoom: number,
  pan: Point,
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
  ctx.translate(pan.x, pan.y);
  ctx.scale(zoom, zoom);

  drawGrid(ctx, width, height, zoom, pan);

  const rc = rough.canvas(canvas);

  elements.forEach((el) => el.draw(rc, ctx));

  const { selectedElementIds, selectionBox } = useCanvasStore.getState();

  if (selectionBox) {
    drawSelectionRect(ctx, zoom, selectionBox);
  }

  if (selectedElementIds && selectedElementIds.length > 0) {
    const selectedElements = elements.filter((el) =>
      selectedElementIds.includes(el.id),
    );

    if (selectedElementIds.length === 1) {
      const bounds = selectedElements[0].getLocalBounds();
      const angle = selectedElements[0].angle;
      drawSelectionHandles(ctx, zoom, bounds, angle);
    } else {
      const groupBounds = getGroupBounds(selectedElements);

      if (groupBounds) {
        drawSelectionHandles(ctx, zoom, groupBounds);
      }

      selectedElements.forEach((el) => {
        const bounds = el.getLocalBounds();
        const angle = el.angle;
        drawSubSelectionBox(ctx, zoom, bounds, angle);
      });
    }
  }

  ctx.restore();
}
