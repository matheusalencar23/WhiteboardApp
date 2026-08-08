import type { CanvasElement } from "../geometry/types";

export function exportToJsonFile(
  elements: CanvasElement[],
  filename = "whiteboard.json",
) {
  const doc = { version: 1, elements };
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function importFromJsonFile(file: File): Promise<CanvasElement[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const doc = JSON.parse(reader.result as string);
        if (!Array.isArray(doc.elements))
          throw new Error("Formato de arquivo inválido");
        resolve(doc.elements);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
