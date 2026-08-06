import { create } from "zustand";
import { IDENTITY_CAMERA, type Camera } from "../lib/canvas/camera";
import type { CanvasElement, Point } from "../lib/geometry/types";
import type { Tool } from "../lib/canvas/types";

interface CanvasStore {
  elements: CanvasElement[];
  addElement: (el: CanvasElement) => void;
  updateElement: (id: string, el: CanvasElement) => void;
  deleteElement: (id: string) => void;

  camera: Camera;
  setCamera: (camera: Camera | ((prev: Camera) => Camera)) => void;

  selectedElementIds: string[];
  setSelectedElementIds: (ids: string[]) => void;
  deleteSelectedElements: () => void;
  addElementId: (id: string) => void;

  selectionBox: { start: Point; current: Point } | null;
  setSelectionBox: (box: { start: Point; current: Point } | null) => void;

  cursor: string;
  setCursor: (cursor: string) => void;

  activeTool: Tool;
  setTool: (tool: Tool) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  elements: [],
  addElement: (el) => set((state) => ({ elements: [...state.elements, el] })),
  updateElement: (id, newEl) =>
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? newEl : el)),
    })),

  deleteElement: (id) =>
    set((state) => ({ elements: state.elements.filter((el) => el.id !== id) })),

  camera: IDENTITY_CAMERA,
  setCamera: (camera) =>
    set((state) => ({
      camera: typeof camera === "function" ? camera(state.camera) : camera,
    })),

  selectedElementIds: [],
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
  deleteSelectedElements: () =>
    set((state) => ({
      elements: state.elements.filter(
        (el) => !state.selectedElementIds.includes(el.id),
      ),
      selectedElementIds: [],
    })),

  addElementId: (id) =>
    set((state) => ({ selectedElementIds: [...state.selectedElementIds, id] })),

  selectionBox: null,
  setSelectionBox: (box) => set({ selectionBox: box }),

  cursor: "default",
  setCursor: (cursor) => set(() => ({ cursor: cursor })),

  activeTool: "selection",
  setTool: (tool) => set(() => ({ activeTool: tool })),
}));
