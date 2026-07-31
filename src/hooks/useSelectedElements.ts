import { getGroupBounds } from "../lib/geometry/bounds";
import { getElementLocalBounds } from "../lib/geometry/elementOperations";
import type { CanvasElement } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";

export function useSelectedElements() {
  const { elements: allElements, selectedElementIds } = useCanvasStore();

  const selected = allElements.filter((el) =>
    selectedElementIds.includes(el.id),
  );

  const bounds =
    selected.length === 1
      ? getElementLocalBounds(selected[0])
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
