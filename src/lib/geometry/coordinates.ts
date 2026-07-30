import type { Bounds, Point } from "./types";

/**
 * Converte um ponto em coordenadas de TELA (ex: clique do mouse, relativo
 * ao canvas) para coordenadas de MUNDO (onde x/y dos elementos vivem).
 *
 * O canvas é desenhado aplicando, nessa ordem: translate(pan) -> scale(zoom).
 * Para desfazer isso (ir de tela para mundo), fazemos o inverso na ordem
 * inversa: primeiro subtrai o pan, depois divide pelo zoom.
 *
 *   screen = world * zoom + pan   =>   world = (screen - pan) / zoom
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  zoom: number,
  pan: Point,
): Point {
  return {
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom,
  };
}

/**
 * Converte um ponto de mundo para o "espaço local" de um elemento
 * rotacionado — ou seja, desfaz a rotação, como se o elemento nunca
 * tivesse girado.
 *
 * Por quê: x/y/width/height de um elemento são SEMPRE armazenados sem
 * rotação (a rotação é aplicada só visualmente, no draw(), via
 * ctx.rotate). Então, para saber "o mouse está em cima do handle
 * nordeste?" de um elemento girado, é mais simples girar o PONTO do
 * mouse de volta (-angle) em torno do centro do elemento, e comparar
 * com as coordenadas locais (não rotacionadas) do handle, do que tentar
 * girar a geometria dos handles para o espaço de tela.
 *
 * Usado em detecção de hover/clique (getHandleAtPoint) — aqui não há
 * problema de "efeito acumulado", porque o centro usado como pivô é
 * recalculado do zero a cada chamada, a partir do estado atual.
 */
export function screenPointToLocalSpace(
  point: Point,
  bounds: Bounds,
  angle: number,
) {
  if (angle === 0) return point;

  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;

  const matrix = new DOMMatrix()
    .translate(cx, cy)
    .rotate(angle)
    .translate(-cx, -cy)
    .inverse();

  const local = matrix.transformPoint(new DOMPoint(point.x, point.y));
  return { x: local.x, y: local.y };
}
