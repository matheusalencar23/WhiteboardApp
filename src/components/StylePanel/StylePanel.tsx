import { useSelectedElements } from "../../hooks/useSelectedElements";
import { ColorStrokeSelection } from "./ColorStrokeSelection/ColorStrokeSelection";
import "./style.css";

export function StylePanel() {
  const { selected } = useSelectedElements();

  return (
    selected.length && (
      <div className="style-panel">
        <p className="style-panel-title">Stroke</p>
        <ColorStrokeSelection />
      </div>
    )
  );
}
