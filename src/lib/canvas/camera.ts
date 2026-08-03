import type { Point } from "../geometry/types";

export interface Camera {
  zoom: number;
  pan: Point;
}

export const IDENTITY_CAMERA: Camera = {
  zoom: 1,
  pan: {
    x: 0,
    y: 0,
  },
};

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const ZOOM_FACTOR = 1.1;

/**
 * Converte as coordenadas da tela para as coordenadas do mundo
 * considerando o deslocamento da tela e o zoom
 */
export function screenToWorld(camera: Camera, screenPoint: Point): Point {
  return {
    x: (screenPoint.x - camera.pan.x) / camera.zoom,
    y: (screenPoint.y - camera.pan.y) / camera.zoom,
  };
}

/**
 * Converte as coordenadas do mundo para as coordenadas da tela
 * considerando o deslocamento da tela e o zoom
 */
export function worldToScreen(camera: Camera, worldPoint: Point): Point {
  return {
    x: worldPoint.x * camera.zoom + camera.pan.x,
    y: worldPoint.y * camera.zoom + camera.pan.y,
  };
}

/**
 * Aplica à câmera ao contexto 2D —
 * tudo desenhado depois disso já está em coordenadas de mundo.
 */
export function applyCameraTransform(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
) {
  ctx.translate(camera.pan.x, camera.pan.y);
  ctx.scale(camera.zoom, camera.zoom);
}

/**
 * Calcula a nova câmera para um zoom centrado em um ponto de tela
 * (ex.: a posição do cursor durante um Ctrl+scroll) — o ponto do mundo
 * que estava sob o cursor antes do zoom continua sob o cursor depois.
 */
export function zoomAtScreenPoint(
  camera: Camera,
  screenPoint: Point,
  zoomingIn: boolean,
): Camera {
  const worldPointUnderCursor = screenToWorld(camera, screenPoint);
  const rawZoom = zoomingIn
    ? camera.zoom * ZOOM_FACTOR
    : camera.zoom / ZOOM_FACTOR;

  const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, rawZoom));

  const pan = {
    x: screenPoint.x - worldPointUnderCursor.x * zoom,
    y: screenPoint.y - worldPointUnderCursor.y * zoom,
  };

  return { zoom, pan };
}

/** Desloca a câmera por um delta em pixels de tela (pan via scroll/arraste). */
export function panBy(camera: Camera, deltaScreen: Point): Camera {
  return {
    zoom: camera.zoom,
    pan: {
      x: camera.pan.x + deltaScreen.x,
      y: camera.pan.y + deltaScreen.y,
    },
  };
}
