import type { Tool } from "../../lib/canvas/types";
import { useCanvasStore } from "../../store/useCanvasStore";
import "./style.css";

const tools: Tool[] = ["selection", "rectangle"];

export function Toolbar() {
  const { activeTool, setTool, setSelectedElementId, setSelectedElementIds } =
    useCanvasStore();

  function selectTool(tool: Tool) {
    setSelectedElementId(null);
    setSelectedElementIds([]);
    setTool(tool);
  }

  return (
    <div className="toolbar">
      {tools.map((tool) => (
        <button
          onClick={() => selectTool(tool)}
          style={{ fontWeight: activeTool === tool ? "bold" : "normal" }}
        >
          {tool}
        </button>
      ))}
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
