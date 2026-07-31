import { getGroupBounds } from "../lib/geometry/bounds";
import { getElementLocalBounds } from "../lib/geometry/elementOperations";
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

  return { selected, bounds, angle };
}
