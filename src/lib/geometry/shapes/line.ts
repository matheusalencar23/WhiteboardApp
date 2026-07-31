import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, LineElement, Point } from "../types";
import { rotatePoint } from "../transform";

/** Converte os pontos locais do elemento para coordenadas de mundo */
function toWorldPoints(el: LineElement): Point[] {
  return el.points.map((p) => ({ x: el.x + p.x, y: el.y + p.y }));
}

export function drawLine(
  el: LineElement,
  rc: RoughCanvas,
  ctx: CanvasRenderingContext2D,
) {
  const worldPoints = toWorldPoints(el);
  const bounds = getLineLocalBounds(el);
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;

  ctx.save();

  if (el.angle !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate((el.angle * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  rc.linearPath(
    worldPoints.map((p) => [p.x, p.y]),
    {
      stroke: el.stroke,
      strokeWidth: el.strokeWidth,
      roughness: el.roughness,
      bowing: el.bowing,
      seed: el.seed,
    },
  );

  ctx.restore();
}

/**
 * Bounds SEM rotação — o bounding box dos pontos locais, deslocado por
 * x/y. É a base tanto para hit-test do bounding box (seleção em caixa)
 * quanto para saber onde fica o centro de rotação do elemento.
 */
export function getLineLocalBounds(el: LineElement): Bounds {
  const xs = el.points.map((p) => p.x);
  const ys = el.points.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: el.x + minX,
    y: el.y + minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Hit-test por proximidade: verdadeiro se o ponto está a até
 * `threshold` pixels (em espaço de mundo) de algum segmento da linha.
 * Diferente de forma "caixa", não existe "dentro" de uma linha — só
 * "perto o suficiente de algum trecho dela".
 */
export function lineContainsPoint(
  el: LineElement,
  point: Point,
  threshold = 6,
): boolean {
  const worldPoints = toWorldPoints(el);

  for (let i = 0; i < worldPoints.length - 1; i++) {
    if (
      distanceToSegment(point, worldPoints[i], worldPoints[i + 1]) <= threshold
    ) {
      return true;
    }
  }
  return false;
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(p.x - a.x, p.y - a.y);
  }

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const closest = { x: a.x + t * dx, y: a.y + t * dy };
  return Math.hypot(p.x - closest.x, p.y - closest.y);
}

export function getLineBounds(el: LineElement): Bounds {
  if (el.angle === 0) return getLineLocalBounds(el);

  const localBounds = getLineLocalBounds(el);
  const cx = localBounds.x + localBounds.width / 2;
  const cy = localBounds.y + localBounds.height / 2;
  const center = { x: cx, y: cy };

  const worldPoints = toWorldPoints(el);
  const rotatedCorners = worldPoints.map((p) =>
    rotatePoint(p, center, el.angle),
  );

  const xs = rotatedCorners.map((p) => p.x);
  const ys = rotatedCorners.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
