import { create } from "zustand";
import type { Element } from "./element";

interface CanvasStore {
  elements: Element[];
  addElement: (el: Element) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  elements: [],
  addElement: (el) => set((state) => ({ elements: [...state.elements, el] })),
}));
