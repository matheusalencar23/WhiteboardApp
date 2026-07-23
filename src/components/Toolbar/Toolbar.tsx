import type { Tool } from "../../lib/canvas/types";
import { useCanvasStore } from "../../store/useCanvasStore";
import { FaMousePointer } from "react-icons/fa";
import { RiRectangleLine } from "react-icons/ri";
import "./style.css";
import type { IconType } from "react-icons";

const tools: { name: Tool; icon: IconType }[] = [
  {
    name: "selection",
    icon: FaMousePointer,
  },
  {
    name: "rectangle",
    icon: RiRectangleLine,
  },
];

export function Toolbar() {
  const { activeTool, setTool, setSelectedElementIds } =
    useCanvasStore();

  function selectTool(tool: Tool) {
    setSelectedElementIds([]);
    setTool(tool);
  }

  return (
    <div className="toolbar">
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => selectTool(tool.name)}
          className={activeTool === tool.name ? "active" : ""}
          title={tool.name}
        >
          {<tool.icon size={16} />}
        </button>
      ))}
    </div>
  );
}
