import { create } from "zustand";
import { IDENTITY_CAMERA, type Camera } from "../lib/canvas/camera";
import type { CanvasElement, Point } from "../lib/geometry/types";

interface CanvasStore {
  elements: CanvasElement[];
  addElement: (el: CanvasElement) => void;
  updateElement: (id: string, el: CanvasElement) => void;

  camera: Camera;
  setCamera: (camera: Camera | ((prev: Camera) => Camera)) => void;

  selectedElementIds: string[];
  deleteSelectedElements: () => void;

  selectionBox: { start: Point; current: Point } | null;

  cursor: string;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  elements: [],
  addElement: (el) => set((state) => ({ elements: [...state.elements, el] })),
  updateElement: (id, newEl) =>
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? newEl : el)),
    })),

  camera: IDENTITY_CAMERA,
  setCamera: (camera) =>
    set((state) => ({
      camera: typeof camera === "function" ? camera(state.camera) : camera,
    })),

  selectedElementIds: [],
  deleteSelectedElements: () =>
    set((state) => ({
      elements: state.elements.filter(
        (el) => !state.selectedElementIds.includes(el.id),
      ),
      selectedElementIds: [],
    })),

  selectionBox: null,

  cursor: "default",
}));
