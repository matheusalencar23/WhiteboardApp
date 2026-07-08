import { useEffect, useRef } from "react";
import "./style.css";
import { useCanvasStore } from "../../store/useCanvasStore";
import { render } from "../../lib/canvas/engine";
import { useCanvasEvents } from "../../hooks/useCanvasEvents";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { elements } = useCanvasStore();
  const { handlePointerDown, handlePointerMove, handlePointerUp } =
    useCanvasEvents();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    render(canvas, elements);
  }, [elements]);

  return (
    <canvas
      ref={canvasRef}
      className="canvas"
      width={window.innerWidth}
      height={window.innerHeight}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    />
  );
}
