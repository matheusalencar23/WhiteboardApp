import { useEffect, useRef } from "react";
import "./style.css";
import { useCanvasStore } from "../../lib/store";
import { Rectangle } from "../../lib/element";
import { render } from "../../lib/render";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { elements, addElement } = useCanvasStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    render(canvas, elements);
  }, [elements]);

  function handlePointerUp() {
    addElement(
      new Rectangle(200, 300, 150, 200, {
        stroke: "red",
        fill: "blue",
        fillStyle: "dashed",
      }),
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="canvas"
      width={window.innerWidth}
      height={window.innerHeight}
      onPointerUp={handlePointerUp}
    />
  );
}
