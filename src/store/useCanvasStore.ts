import { create } from "zustand";
import type { IElement } from "../lib/geometry/types";
import type { Tool } from "../lib/canvas/types";

interface CanvasStore {
  elements: IElement[];
  addElement: (el: IElement) => void;
  updateElement: (id: string, el: IElement) => void;

  activeTool: Tool | null;
  setTool: (tool: Tool | null) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  elements: [],
  addElement: (el) => set((state) => ({ elements: [...state.elements, el] })),
  updateElement: (id, newEl) =>
    set((state) => {
      console.log(newEl);
      return {
        elements: state.elements.map((el) => (el.id === id ? newEl : el)),
      };
    }),
  activeTool: null,
  setTool: (tool) => set({ activeTool: tool }),
}));
