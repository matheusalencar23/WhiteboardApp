import { useSelectedElements } from "../../../hooks/useSelectedElements";
import { useCanvasStore } from "../../../store/useCanvasStore";
import { cloneElement } from "../../../lib/geometry/createElement";
import "./style.css";

export function StrokeWidthSlider() {
  const { updateElement } = useCanvasStore();
  const { selected, getSelectedPropertyValue } = useSelectedElements();
  const selectedStrokeWidth = getSelectedPropertyValue("strokeWidth") ?? 1;

  function changeStrokeWidth(value: number) {
    selected.forEach((el) =>
      updateElement(el.id, cloneElement(el, { strokeWidth: value })),
    );
  }

  return (
    <input
      type="range"
      min="1"
      max="10"
      value={selectedStrokeWidth}
      step="1"
      onChange={(e) => changeStrokeWidth(e.target.valueAsNumber)}
    />
  );
}
