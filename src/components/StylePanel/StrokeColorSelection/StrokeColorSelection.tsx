import { useSelectedElements } from "../../../hooks/useSelectedElements";
import { useCanvasStore } from "../../../store/useCanvasStore";
import { Divider } from "../../../ui/Divider/Divider";
import { cloneElement } from "../../../lib/geometry/createElement";
import { BlockPicker, type ColorResult } from "react-color";
import "./style.css";
import { useState } from "react";

const STROKE_COLORS = ["#000000", "#ff0000", "#00ff00", "#0000ff"];

export function StrokeColorSelection() {
  const { updateElement } = useCanvasStore();
  const { selected, getSelectedPropertyValue } = useSelectedElements();
  const selectedStrokeColor = getSelectedPropertyValue("stroke") ?? "transparent";

  const [showPicker, setShowPicker] = useState(false);

  function changeStrokeColor(color: string) {
    selected.forEach((el) =>
      updateElement(el.id, cloneElement(el, { stroke: color })),
    );
  }

  function handleColorPicker(color: ColorResult) {
    changeStrokeColor(color.hex);
    setShowPicker(false);
  }

  return (
    <>
      <div className="stroke-color-container">
        {STROKE_COLORS.map((color) => (
          <div
            key={color}
            className={`stroke-color-item ${color === selectedStrokeColor ? "active" : ""}`}
          >
            <button
              className="stroke-color-button"
              onClick={() => changeStrokeColor(color)}
              style={{ backgroundColor: color }}
            ></button>
          </div>
        ))}
        <Divider />
        <div
          className={`stroke-color-item ${selectedStrokeColor ? "active" : ""}`}
        >
          <button
            className="stroke-color-button"
            onClick={() => setShowPicker((value) => !value)}
            style={{ backgroundColor: selectedStrokeColor || "transparent" }}
          ></button>
        </div>
        {showPicker && (
          <div className="stroke-color-picker">
            <BlockPicker
              width="300px"
              triangle="hide"
              color={selectedStrokeColor || "transparent"}
              onChange={handleColorPicker}
            />
          </div>
        )}
      </div>
    </>
  );
}
