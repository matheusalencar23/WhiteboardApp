import {
  getElementBounds,
  getElementGeometry,
} from "../lib/geometry/elementOperations";
import type { CanvasElement } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";

/** Caixa que envolve um grupo de elementos, já rotacionados individualmente. */
function getGroupBounds(elements: CanvasElement[]) {
  if (elements.length === 0) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  elements.forEach((el) => {
    const bounds = getElementBounds(el);
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  });

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function useSelectedElements() {
  const { elements: allElements, selectedElementIds } = useCanvasStore();

  const selected = allElements.filter((el) =>
    selectedElementIds.includes(el.id),
  );

  const bounds =
    selected.length === 1
      ? getElementGeometry(selected[0])
      : getGroupBounds(selected);

  const angle = selected.length === 1 ? selected[0].angle : 0;

  function getSelectedPropertyValue<K extends keyof CanvasElement>(
    key: K,
  ): CanvasElement[K] | null {
    if (selected.length === 0) return null;
    const first = selected[0][key];
    const allSame = selected.every((el) => el[key] === first);
    return allSame ? first : null;
  }

  return { selected, bounds, angle, getSelectedPropertyValue };
}
