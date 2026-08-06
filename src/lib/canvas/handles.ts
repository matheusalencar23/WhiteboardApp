import type { Bounds, HandleType, Point } from "../geometry/types";

const HANDLE_PADDING = 8;
const ROTATION_OFFSET = 24;

export const RESIZE_HANDLE_TYPES: HandleType[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

/**
 * Posições (centro de cada handle) ao redor de uma caixa, em coordenadas
 * de mundo. Única fonte de verdade — usada tanto para desenhar os
 * handles quanto para detectar clique/hover sobre eles (useResizeMode,
 * useRotationMode), evitando que as duas coisas divirjam com o tempo.
 */
export function getHandlePositions(
  bounds: Bounds,
  zoom: number,
): Record<HandleType, Point> {
  const padding = HANDLE_PADDING / zoom;

  const x0 = bounds.x - padding;
  const y0 = bounds.y - padding;

  const x1 = bounds.x + bounds.width + padding;
  const y1 = bounds.y + bounds.height + padding;

  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;

  return {
    nw: { x: x0, y: y0 },
    n: { x: midX, y: y0 },
    ne: { x: x1, y: y0 },
    e: { x: x1, y: midY },
    se: { x: x1, y: y1 },
    s: { x: midX, y: y1 },
    sw: { x: x0, y: y1 },
    w: { x: x0, y: midY },
    rotation: { x: midX, y: y0 - ROTATION_OFFSET / zoom },
  };
}
