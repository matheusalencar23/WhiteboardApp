import type { CanvasElement } from "../geometry/types";

const STORAGE_KEY = "whiteboard-app:elements";
const SCHEMA_VERSION = 1;

interface StoredDocument {
  version: number;
  elements: CanvasElement[];
}

export function saveToLocalStorage(elements: CanvasElement[]) {
  try {
    const doc: StoredDocument = { version: SCHEMA_VERSION, elements };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch (error) {
    console.error("Falha ao salvar elementos no localStorage: ", error);
  }
}

export function loadFromLocalStorage(): CanvasElement[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const doc = JSON.parse(raw) as StoredDocument;
    if (doc.version !== SCHEMA_VERSION) {
      console.warn("Versão do documento salvo incompatível!");
      return null;
    }

    return doc.elements;
  } catch (error) {
    console.error("Falha ao carregar elementos do localStorage: ", error);
    return null;
  }
}
