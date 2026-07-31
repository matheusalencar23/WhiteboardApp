import { useSelectedElements } from "../../hooks/useSelectedElements";
import { StrokeColorSelection } from "./StrokeColorSelection/StrokeColorSelection";
import "./style.css";
import { StrokeWidthSlider } from "./StrokeWidthSlider/StrokeWidthSlider";

export function StylePanel() {
  const { selected } = useSelectedElements();

  return (
    selected.length && (
      <div className="style-panel">
        <p className="style-panel-title">Stroke</p>
        <StrokeColorSelection />
        <p className="style-panel-title">Stroke Width</p>
        <StrokeWidthSlider />
      </div>
    )
  );
}
