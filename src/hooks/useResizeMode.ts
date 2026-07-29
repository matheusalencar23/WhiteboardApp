import type { IElement, Point } from "../lib/geometry/types";
import { useCanvasStore } from "../store/useCanvasStore";
import {
  calculateResizeBounds,
  getGroupBounds,
  getHandleAtPoint,
} from "../lib/geometry/utils";
import { ElementFactory } from "../lib/geometry/elementFactory";

export function useResizeMode() {
  const {
    elements,
    updateElement,
    zoom,
    selectedElementIds,
    setCursor,
    clearCursor,
    activeHandle,
    setActiveHandle,
    initialGroupBounds,
    setInitialGroupBounds,
    initialElementsSnapshot,
    setInitialElementsSnapshot,
  } = useCanvasStore();

  function selectedElements() {
    return elements.filter((el) => selectedElementIds.includes(el.id));
  }

  function tryStartResize(worldPoint: Point): boolean {
    if (selectedElements().length === 0) return false;

    const elements = selectedElements();
    let bounds;
    if (elements.length === 1) {
      bounds = elements[0].getLocalBounds();
    } else {
      bounds = getGroupBounds(selectedElements());
    }

    if (!bounds) return false;

    const handle = getHandleAtPoint(
      worldPoint,
      bounds,
      zoom,
      elements.length === 1 ? elements[0].angle : 0,
    );
    if (!handle || handle === "rotation") return false;

    setCursor("grabbing");
    setActiveHandle(handle);
    setInitialGroupBounds(bounds);
    setInitialElementsSnapshot([...selectedElements()]);
    return true;
  }

  function updateHoverCursor(worldPoint: Point) {
    if (activeHandle || selectedElements().length === 0) return;

    const elements = selectedElements();
    let bounds;
    if (elements.length === 1) {
      bounds = elements[0].getLocalBounds();
    } else {
      bounds = getGroupBounds(selectedElements());
    }

    if (!bounds) return false;

    const handle = getHandleAtPoint(
      worldPoint,
      bounds,
      zoom,
      elements.length === 1 ? elements[0].angle : 0,
    );
    if (handle) {
      setCursor("grab");
    } else {
      clearCursor();
    }
  }

  function resize(worldPoint: Point): boolean {
    if (
      !activeHandle ||
      !initialGroupBounds ||
      initialElementsSnapshot.length === 0
    ) {
      return false;
    }

    if (initialElementsSnapshot.length === 1) {
      const initialEl = initialElementsSnapshot[0];
      const angle = initialEl.angle || 0;

      if (angle !== 0) {
        resizeElement(initialEl, activeHandle, worldPoint);
        return true;
      }
    }

    const newGroupBounds = calculateResizeBounds(
      initialGroupBounds,
      activeHandle,
      worldPoint,
    );

    const initialWidth = initialGroupBounds.width || 1;
    const initialHeight = initialGroupBounds.height || 1;

    initialElementsSnapshot.forEach((selectedEl) => {
      const bounds = selectedEl.getBounds();

      const relX = (bounds.x - initialGroupBounds!.x) / initialWidth;
      const relY = (bounds.y - initialGroupBounds!.y) / initialHeight;
      const relWidth = bounds.width / initialWidth;
      const relHeight = bounds.height / initialHeight;

      const newX = newGroupBounds.x + relX * newGroupBounds.width;
      const newY = newGroupBounds.y + relY * newGroupBounds.height;
      const newW = relWidth * newGroupBounds.width;
      const newH = relHeight * newGroupBounds.height;

      const id = selectedEl.id;
      const el = ElementFactory.create(
        selectedEl.type!,
        newX,
        newY,
        newW,
        newH,
        { ...selectedEl.properties },
      );

      updateElement(id, el);
    });

    return true;
  }

  function stopResize() {
    setActiveHandle(null);
    setInitialGroupBounds(null);
    setInitialElementsSnapshot([]);
  }

  function isResizing() {
    return !!activeHandle && activeHandle !== "rotation";
  }

  function resizeElement(initialEl: IElement, handle: string, mouse: Point) {
    const rad = ((initialEl.angle || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Vetores diretores dos eixos locais X e Y do elemento
    const uX = { x: cos, y: sin };
    const uY = { x: -sin, y: cos };

    // Centro da caixa antes de ser redimensionada
    const cx0 = initialEl.x + initialEl.width / 2;
    const cy0 = initialEl.y + initialEl.height / 2;

    // Distância do mouse até o centro antigo
    const dx = mouse.x - cx0;
    const dy = mouse.y - cy0;

    // Projeta a posição do mouse sobre os eixos locais do elemento
    const projX = dx * uX.x + dy * uX.y;
    const projY = dx * uY.x + dy * uY.y;

    let localW = initialEl.width;
    let localH = initialEl.height;
    let shiftX = 0;
    let shiftY = 0;

    const halfW = initialEl.width / 2;
    const halfH = initialEl.height / 2;

    // Ajusta o width e empurra o centro para manter o lado oposto ancorado
    if (handle.includes("e")) {
      localW = Math.max(5, projX + halfW);
      shiftX = (localW - initialEl.width) / 2;
    } else if (handle.includes("w")) {
      localW = Math.max(5, halfW - projX);
      shiftX = -(localW - initialEl.width) / 2;
    }

    // Ajusta o height e empurra o centro
    if (handle.includes("s")) {
      localH = Math.max(5, projY + halfH);
      shiftY = (localH - initialEl.height) / 2;
    } else if (handle.includes("n")) {
      localH = Math.max(5, halfH - projY);
      shiftY = -(localH - initialEl.height) / 2;
    }

    // Calcula onde vai ficar o novo centro global usando os eixos projetados
    const newCx = cx0 + shiftX * uX.x + shiftY * uY.x;
    const newCy = cy0 + shiftX * uX.y + shiftY * uY.y;

    // Decompõe o centro de volta para as coordenadas x, y (top-left local)
    const newX = newCx - localW / 2;
    const newY = newCy - localH / 2;

    const el = ElementFactory.create(
      initialEl.type!,
      newX,
      newY,
      localW,
      localH,
      {
        ...initialEl.properties,
        angle: initialEl.angle || 0,
      },
    );

    updateElement(initialEl.id, el);
  }

  return {
    isResizing,
    tryStartResize,
    updateHoverCursor,
    updateResize: resize,
    stopResize,
  };
}
