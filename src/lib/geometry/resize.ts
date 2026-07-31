import { getElementLocalBounds } from "./elementOperations";
import {
  calculateAxisAlignedResizeBounds,
  getBoundsAnchorPoint,
} from "./handles";
import type { Bounds, CanvasElement, HandleType, Point } from "./types";

/**
 * Redimensiona UM elemento (possivelmente rotacionado), fazendo o canto/
 * aresta oposto ao handle arrastado permanecer fixo no mundo (o "anchor").
 *
 * Abordagem: em vez de trabalhar em coordenadas de mundo (onde a rotação
 * complica tudo), projetamos o movimento do mouse nos EIXOS LOCAIS do
 * elemento (uX = "direita" do elemento, uY = "baixo" do elemento, já
 * rotacionados). Isso reduz o problema a uma conta de retângulo comum,
 * sem rotação, e só no final convertemos o resultado de volta pra mundo.
 *
 * Passo a passo:
 * 1. uX/uY: vetores unitários que apontam para "direita" e "baixo" do
 *    elemento, considerando sua rotação atual.
 * 2. dx/dy: vetor do centro do elemento até o mouse, em coordenadas de
 *    mundo.
 * 3. projX/projY: o mesmo vetor, mas medido ao longo de uX/uY — ou seja,
 *    "quanto o mouse se moveu na direção local do elemento", ignorando
 *    a rotação.
 * 4. A partir da projeção, calculamos a nova largura/altura RAW (pode
 *    dar negativo se o mouse passar do outro lado — isso representa um
 *    "flip").
 * 5. anchorGlobal: a posição em mundo do canto/aresta que deve ficar
 *    parado (oposto ao handle arrastado) — calculado a partir do
 *    elemento ORIGINAL (início do gesto), nunca recalculado durante o
 *    drag. Isso é o que evita "drift": se recalculássemos o anchor a
 *    cada frame a partir do centro atual (que se move conforme o
 *    elemento encolhe/cresce), o ponto fixo escorregaria pouco a pouco.
 * 6. finalWidth/finalHeight: sempre positivos (abs do raw).
 * 7. newCx/newCy: novo centro do elemento, derivado do anchor fixo +
 *    metade do novo tamanho, na direção correta (dirX/dirY cuidam do
 *    caso de flip).
 *
 * IMPORTANTE: cX, cY, uX, uY vêm sempre do "snapshot" do elemento no
 * início do gesto (element = initialElementsSnapshot[0]), nunca do
 * estado atual — é isso que garante que o anchor não se move durante
 * o arraste.
 */
export function calculateRotatedResize(
  element: CanvasElement,
  handle: HandleType,
  mouse: Point,
): Bounds {
  const angle = element.angle || 0;
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const uX = { x: cos, y: sin };
  const uY = { x: -sin, y: cos };

  const cX = element.x + element.width / 2;
  const cY = element.y + element.height / 2; // fix: era element.x/width

  const dx = mouse.x - cX;
  const dy = mouse.y - cY;
  const projX = dx * uX.x + dy * uX.y;
  const projY = dx * uY.x + dy * uY.y;

  const halfWidth = element.width / 2;
  const halfHeight = element.height / 2;

  let rawWidth = element.width;
  let rawHeight = element.height;

  let anchorSignX = 0;
  let anchorSignY = 0;

  if (handle.includes("e")) {
    rawWidth = projX + halfWidth;
    anchorSignX = -1;
  } else if (handle.includes("w")) {
    rawWidth = halfWidth - projX; // fix: era halfHeight
    anchorSignX = 1;
  }

  if (handle.includes("s")) {
    rawHeight = projY + halfHeight;
    anchorSignY = -1;
  } else if (handle.includes("n")) {
    rawHeight = halfHeight - projY;
    anchorSignY = 1;
  }

  const anchorGlobalX =
    cX + anchorSignX * halfWidth * uX.x + anchorSignY * halfHeight * uY.x;
  const anchorGlobalY =
    cY + anchorSignX * halfWidth * uX.y + anchorSignY * halfHeight * uY.y;

  const finalWidth = Math.abs(rawWidth);
  const finalHeight = Math.abs(rawHeight);

  const dirX = rawWidth < 0 ? -anchorSignX : anchorSignX;
  const dirY = rawHeight < 0 ? -anchorSignY : anchorSignY;

  const newCx =
    anchorGlobalX -
    dirX * (finalWidth / 2) * uX.x -
    dirY * (finalHeight / 2) * uY.x;
  const newCy =
    anchorGlobalY -
    dirX * (finalWidth / 2) * uX.y -
    dirY * (finalHeight / 2) * uY.y;

  return {
    x: newCx - finalWidth / 2,
    y: newCy - finalHeight / 2,
    width: finalWidth,
    height: finalHeight,
  };
}

/**
 * Redimensiona um grupo de elementos a partir do handler arrastado
 *
 * Handles de canto (nw, ne, se, sw) escalam os dois eixos livremente.
 * Handles de aresta (n, s, e, w) escalam só o eixo correspondente - a menos
 * que algum elemento do grupo esteja rotacionado, caso em que a escala é
 * forçada a ser uniforme nos dois eixos (ver `hasRotatedElement`)
 *
 * Por quê: escalar uma retângulo rotacionado de forma não uniforme
 * (só largura, ou largura e altura em proporçoes diferentes) produz
 * matematicamente um paralelogramo - e o modelo de dados do editor
 * (x, y, width, height, angle) não representa isso. Forçar escala
 * uniforme nesse caso evita a distorção visual, ao custo de não poder
 * "eticar" só o eixo enquanto o grupo estiver rotacionado.
 */
export function calculateGroupResize(
  elements: CanvasElement[],
  groupBounds: Bounds,
  handle: HandleType,
  mouseWorldPoint: Point,
) {
  const newGroupBounds = calculateAxisAlignedResizeBounds(
    groupBounds,
    handle,
    mouseWorldPoint,
  );

  const rawScaleX = newGroupBounds.width / (groupBounds.width || 1);
  const rawScaleY = newGroupBounds.height / (groupBounds.height || 1);

  const hasRotatedElement = elements.some((el) => (el.angle || 0) % 360 !== 0);

  const { scaleX, scaleY } = hasRotatedElement
    ? resolveUniformScale(handle, rawScaleX, rawScaleY)
    : { scaleX: rawScaleX, scaleY: rawScaleY };

  const anchor = getBoundsAnchorPoint(groupBounds, handle);

  return elements.map((el) => {
    const elBounds = getElementLocalBounds(el);

    // Posição/tamanho do elemento expressos como distância a partir do
    // anchor (o canto do grupo que fica fixo durante o gesto), depois
    // escalados e "reancorados" no mesmo ponto.
    const relX = elBounds.x - anchor.x;
    const relY = elBounds.y - anchor.y;

    const x = anchor.x + relX * scaleX;
    const y = anchor.y + relY * scaleY;
    const width = elBounds.width * scaleX;
    const height = elBounds.height * scaleY;

    return { id: el.id, x, y, width, height };
  });
}

/**
 * Decide a magnitude de escala uniforme a aplicar nos dois eixos, com
 * base em qual(is) eixo(s) o handle arrastado realmente controla.
 *
 * - Handle de canto: os dois eixos mudam de fato -> média entre eles.
 * - Handle de aresta (e/w): só X muda de verdade -> usa |rawScaleX|
 *   como magnitude para os dois eixos, senão o resize "arrasta" mais
 *   devagar que o mouse (fica preso perto de 0.5 por causa do eixo
 *   parado) e inverte abruptamente perto da borda oposta.
 * - Handle de aresta (n/s): mesma lógica, espelhada para Y.
 */
function resolveUniformScale(
  handle: HandleType,
  rawScaleX: number,
  rawScaleY: number,
) {
  const changesX = handle.includes("e") || handle.includes("w");
  const changesY = handle.includes("n") || handle.includes("s");

  let magnitude: number;

  if (changesX && changesY) {
    magnitude = (Math.abs(rawScaleX) + Math.abs(rawScaleY)) / 2;
  } else if (changesX) {
    magnitude = Math.abs(rawScaleX);
  } else {
    magnitude = Math.abs(rawScaleY);
  }

  return {
    scaleX: Math.sign(rawScaleX || 1) * magnitude,
    scaleY: Math.sign(rawScaleY || 1) * magnitude,
  };
}
