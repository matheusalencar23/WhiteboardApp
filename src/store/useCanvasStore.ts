import { create } from "zustand";
import type { IElement, Point } from "../lib/geometry/types";
import type { Tool } from "../lib/canvas/types";

interface CanvasStore {
  elements: IElement[];
  addElement: (el: IElement) => void;
  updateElement: (id: string, el: IElement) => void;

  activeTool: Tool;
  setTool: (tool: Tool) => void;

  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;

  pan: Point;
  setPan: (pan: Point | ((prev: Point) => Point)) => void;

  setZoomAndPan: (zoom: number, pan: Point) => void;

  selectedElementId: string | null;
  setSelectedElementId: (elementId: string | null) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  elements: [],
  addElement: (el) => set((state) => ({ elements: [...state.elements, el] })),
  updateElement: (id, newEl) =>
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? newEl : el)),
    })),

  activeTool: "selection",
  setTool: (tool) => set({ activeTool: tool }),

  zoom: 1,
  setZoom: (zoom) =>
    set((state) => ({
      zoom: typeof zoom === "function" ? zoom(state.zoom) : zoom,
    })),

  pan: { x: 0, y: 0 },
  setPan: (pan) =>
    set((state) => ({ pan: typeof pan === "function" ? pan(state.pan) : pan })),

  setZoomAndPan: (zoom, pan) => set(() => ({ zoom, pan })),

  selectedElementId: null,
  setSelectedElementId: (elementId) =>
    set(() => ({ selectedElementId: elementId })),
}));
