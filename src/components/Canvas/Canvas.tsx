import { useEffect, useRef, useState } from "react";
import "./style.css";
import { useCanvasStore } from "../../store/useCanvasStore";
import { render } from "../../lib/canvas/engine";
import { useCanvasEvents } from "../../hooks/useCanvasEvents";
import { screenToWorld } from "../../lib/geometry/utils";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { elements, zoom, pan, setZoomAndPan, setPan, selectedElementId } =
    useCanvasStore();
  const { handlePointerDown, handlePointerMove, handlePointerUp } =
    useCanvasEvents();

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    render(canvas, elements, zoom, pan);
  }, [elements, pan, zoom, dimensions, selectedElementId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scrollSpeed = 1.5;
      if (event.ctrlKey) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const worldPoint = screenToWorld(mouseX, mouseY, zoom, pan);

        const zoomFactor = 1.1;
        const newZoom =
          event.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
        const zoomClamped = Math.max(0.1, Math.min(8, newZoom));

        const novoPanX = mouseX - worldPoint.x * zoomClamped;
        const novoPanY = mouseY - worldPoint.y * zoomClamped;

        setZoomAndPan(zoomClamped, { x: novoPanX, y: novoPanY });
      } else if (event.shiftKey) {
        setPan((prevPan) => ({
          x: prevPan.x - event.deltaY * scrollSpeed,
          y: prevPan.y,
        }));
      } else {
        setPan((prevPan) => ({
          x: prevPan.x,
          y: prevPan.y - event.deltaY * scrollSpeed,
        }));
      }
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [zoom, pan, setPan, setZoomAndPan]);

  return (
    <canvas
      ref={canvasRef}
      className="canvas"
      width={dimensions.width}
      height={dimensions.height}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    />
  );
}
