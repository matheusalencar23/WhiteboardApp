import type { Point } from "./types";

/**
 * Converte um ângulo em radianos para graus
 */
export function radiansToDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

/**
 * Converte um ângulo em graus para radianos
 */
export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcula o ângulo de rotação entre dois pontos
 */
export function calculateRotationAngle(center: Point, mouse: Point) {
  const dx = mouse.x - center.x;
  const dy = mouse.y - center.y;
  const radians = Math.atan2(dy, dx);
  // adicionamos 90 graus para compensar a diferença entre o eixo X e alça de rotação dos elementos
  let degrees = radiansToDegrees(radians) + 90;
  if (degrees < 0) degrees += 360;
  return Math.round(degrees);
}

/**
 * Rotaciona um ponto (x, y) em torno de um ponto central (cx, cy) por um ângulo em radianos
 *  * 1. ROTAÇÃO EM TORNO DA ORIGEM (0, 0):
 *    Considere o ponto P(x, y) a uma distância r da origem com ângulo inicial α:
 *      x = r * cos(α)
 *      y = r * sin(α)
 *
 *    Rotacionando por um ângulo θ no sentido anti-horário:
 *      x' = r * cos(α + θ)
 *      y' = r * sin(α + θ)
 *
 *    Aplicando as identidades da soma de arcos:
 *      cos(α + θ) = cos(α)cos(θ) - sin(α)sin(θ)
 *      sin(α + θ) = sin(α)cos(θ) + cos(α)sin(θ)
 *
 *    Substituindo x = r*cos(α) e y = r*sin(α):
 *      x' = x * cos(θ) - y * sin(θ)
 *      y' = x * sin(θ) + y * cos(θ)
 *
 * 2. GENERALIZAÇÃO PARA CENTRO C(xc, yc):
 *    a) Translada o ponto para o sistema relativo do centro:
 *       dx = x - xc
 *       dy = y - yc
 *
 *    b) Aplica a rotação nas coordenadas relativas (dx, dy):
 *       dx' = dx * cos(θ) - dy * sin(θ)
 *       dy' = dx * sin(θ) + dy * cos(θ)
 *
 *    c) Desfaz a translação somando as coordenadas de C:
 *       x' = xc + (x - xc) * cos(θ) - (y - yc) * sin(θ)
 *       y' = yc + (x - xc) * sin(θ) + (y - yc) * cos(θ)
 * ============================================================================
 */
export function rotatePoint(
  point: Point,
  center: Point,
  angleInDegrees: number,
): Point {
  const rad = degreesToRadians(angleInDegrees);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const x = center.x + dx * cos - dy * sin;
  const y = center.y + dy * cos + dx * sin;
  return { x, y };
}
