import type { Point } from "./types";

/**
 * Ângulo (em graus, 0-360) do vetor entre um centro e um ponto do mouse,
 * medido a partir do "topo" (12h) do relógio, sentido horário — que é
 * a convenção usada pelo ângulo `angle` de um elemento (0° = sem rotação,
 * a alça de rotação nasce no topo).
 *
 * atan2 por padrão mede a partir do eixo +X (3h), sentido anti-horário
 * (ou horário, dependendo da orientação do eixo Y). O "+90" gira essa
 * referência de 3h para 12h, alinhando com a convenção do editor.
 */
export function calculateRotationAngle(
  centerPoint: Point,
  currentMousePoint: Point,
): number {
  const radians = Math.atan2(
    currentMousePoint.y - centerPoint.y,
    currentMousePoint.x - centerPoint.x,
  );

  let degrees = (radians * 180) / Math.PI + 90;
  if (degrees < 0) degrees += 360;

  return Math.round(degrees);
}

/**
 * Gira um ponto em torno de um centro, por um ângulo em graus (sentido
 * horário, mesma convenção do angle dos elementos). Usado tanto para
 * girar a posição de cada elemento em torno do centro do grupo durante
 * rotação em grupo, quanto para achar a posição de um anchor rotacionado.
 */
export function rotatePoint(
  point: Point,
  center: Point,
  angleInDegrees: number,
): Point {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  const cos = Math.cos(angleInRadians);
  const sin = Math.sin(angleInRadians);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}
