import { useCanvasStore } from "../../store/useCanvasStore";
import "./style.css";

export function Toolbar() {
  const { activeTool, setTool } = useCanvasStore();

  return (
    <div className="toolbar">
      <button
        onClick={() => setTool("selection")}
        style={{ fontWeight: activeTool === "selection" ? "bold" : "normal" }}
      >
        Selecionar
      </button>
      <button
        onClick={() => setTool("rectangle")}
        style={{ fontWeight: activeTool === "rectangle" ? "bold" : "normal" }}
      >
        Retângulo
      </button>
      <h1>T</h1>
      <h1>O</h1>
      <h1>O</h1>
      <h1>L</h1>
      <h1>B</h1>
      <h1>A</h1>
      <h1>R</h1>
    </div>
  );
}
