import { useState, useCallback, useEffect } from "react";
import type { Annotation } from "../types";

const STORAGE_PREFIX = "annotations-";

function loadAnnotations(docId: string): Annotation[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${docId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAnnotations(docId: string, annotations: Annotation[]) {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${docId}`,
      JSON.stringify(annotations)
    );
  } catch {
    console.warn("Failed to save annotations — localStorage may be full");
  }
}

export function useAnnotations(docId: string | null) {
  const [annotations, setAnnotations] = useState<Annotation[]>(() =>
    docId ? loadAnnotations(docId) : []
  );

  useEffect(() => {
    if (docId) {
      setAnnotations(loadAnnotations(docId));
    } else {
      setAnnotations([]);
    }
  }, [docId]);

  const addAnnotation = useCallback(
    (
      selectedText: string,
      startOffset: number,
      endOffset: number,
      note: string
    ) => {
      if (!docId) return null;

      const annotation: Annotation = {
        id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        docId,
        selectedText,
        startOffset,
        endOffset,
        note,
        createdAt: new Date().toISOString(),
      };

      setAnnotations((prev) => {
        const updated = [...prev, annotation];
        saveAnnotations(docId, updated);
        return updated;
      });

      return annotation;
    },
    [docId]
  );

  const deleteAnnotation = useCallback(
    (annotationId: string) => {
      if (!docId) return;

      setAnnotations((prev) => {
        const updated = prev.filter((a) => a.id !== annotationId);
        saveAnnotations(docId, updated);
        return updated;
      });
    },
    [docId]
  );

  const updateAnnotation = useCallback(
    (annotationId: string, updates: Partial<Pick<Annotation, "note">>) => {
      if (!docId) return;

      setAnnotations((prev) => {
        const updated = prev.map((a) =>
          a.id === annotationId ? { ...a, ...updates } : a
        );
        saveAnnotations(docId, updated);
        return updated;
      });
    },
    [docId]
  );

  return {
    annotations,
    addAnnotation,
    deleteAnnotation,
    updateAnnotation,
  };
}