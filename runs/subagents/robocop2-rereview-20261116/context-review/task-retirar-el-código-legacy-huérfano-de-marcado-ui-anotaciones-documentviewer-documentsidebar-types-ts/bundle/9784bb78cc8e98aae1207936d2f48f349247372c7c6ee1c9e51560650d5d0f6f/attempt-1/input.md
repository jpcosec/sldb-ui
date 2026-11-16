FILE:desk/tasks/task-retirar-el-código-legacy-huérfano-de-marcado-ui-anotaciones-documentviewer-documentsidebar-types-ts.md
---
sldb:
  by: agent
  at: '2026-11-16T12:43:55Z'
  authority: generated
  via: save_document_payload
id: task-retirar-el-código-legacy-huérfano-de-marcado-ui-anotaciones-documentviewer-documentsidebar-types-ts
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- 7f0579a:desk/drawer/report-ui-purpose-gap.md (git show)
depends_on: []
pills: []
files:
- src/components/AnnotationPopup.tsx
- src/components/AnnotationsList.tsx
- src/components/DocumentViewer.tsx
- src/components/DocumentSidebar.tsx
- src/hooks/useAnnotations.ts
- src/hooks/useAnnotationHighlights.ts
- src/types.ts
- src/utils/frontmatter.ts
- src/__tests__/annotationPopup.test.tsx
- src/__tests__/annotationsList.test.tsx
- src/__tests__/documentViewer.test.tsx
- src/__tests__/sidebar.test.tsx
- src/__tests__/useAnnotations.test.ts
- src/__tests__/utils.test.ts
task_type: task.refactor
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/report-ui-purpose-gap.md
---

# Retirar el código legacy huérfano de marcado-ui (anotaciones, DocumentViewer, DocumentSidebar, types.ts, utils/frontmatter)

## Rationale

_Explain why this task exists or the business driver behind it._

El reporte del drawer (desk/drawer/report-ui-purpose-gap.md, huecos 3, 4 y 5) encontró un subsistema anterior al workspace Marcado que ya no se usa. Verificado el 2026-11-16 sobre el commit 4515a8b: src/App.tsx y src/components/document-workspace.tsx no importan ninguno de estos archivos. Solo se importan entre ellos y desde sus propios tests. Ese código usa los tipos Document/Annotation/Frontmatter de src/types.ts, que no tienen relación con MarcadoDocument, y confunde a quien llega al repo.

## Goal

_Describe the concrete result this task must produce._

Borrar del repo UIs/marcado-ui los archivos legacy sin uso y sus tests, sin cambiar el comportamiento del workspace: las suites vivas siguen verdes con los mismos tests y `npm run build` compila.

## Scope

_State what is in scope and what is out of scope._

ENTRA: borrar con git rm exactamente estos 14 archivos y nada más. Fuentes (8): src/components/AnnotationPopup.tsx, src/components/AnnotationsList.tsx, src/components/DocumentViewer.tsx, src/components/DocumentSidebar.tsx, src/hooks/useAnnotations.ts, src/hooks/useAnnotationHighlights.ts, src/types.ts, src/utils/frontmatter.ts. Tests (6, con 62 tests en total): src/__tests__/annotationPopup.test.tsx (12), annotationsList.test.tsx (7), documentViewer.test.tsx (9), sidebar.test.tsx (15), useAnnotations.test.ts (11), utils.test.ts (8). NO ENTRA: package.json (verificado el 2026-11-16: react, react-icons/fi, react-markdown y remark-gfm, las únicas dependencias externas de esos archivos, también las usan src/App.tsx y src/components/document-workspace.tsx, así que no se quita ninguna dependencia); README.md (no menciona ninguno de esos archivos; sus rutas tools/marcado-ui no son de esta tarea); src/App.tsx, src/components/document-workspace.tsx, workspace-shell.tsx, workspace-navigator.tsx, src/lib/*, funciones nuevas o estilos. Regla de parada: si el grep del paso 2 encuentra una coincidencia en un archivo que no está en la lista, ese archivo vivo depende de algo de la lista. En ese caso no se borra el archivo de la lista del que depende, se sigue con el resto y se anota en runs/subagents/20261116-marcado-ui-legacy/result-summary.md qué archivo vivo lo importa. Si la compilación de un archivo vivo falla después de un borrado, se aplica la misma regla: git restore del archivo borrado y nota en result-summary.md.

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui, rama main, máquina robocop2. Directorio de evidencia (run): runs/subagents/20261116-marcado-ui-legacy/. 1) Goldens antes del cambio: TMPDIR=/dev/shm npx vitest run src/__tests__/integration.test.tsx src/__tests__/marcado-ui.ux.test.tsx src/__tests__/marcado-adapter.test.ts src/__tests__/workspace-state.test.ts > runs/subagents/20261116-marcado-ui-legacy/goldens-before.txt 2>&1. Hoy da 4 archivos y 23 tests pasados (9+9+3+2). Registrarlo: deskops review record task-retirar-el-código-legacy-huérfano-de-marcado-ui-anotaciones-documentviewer-documentsidebar-types-ts --kind goldens --evidence runs/subagents/20261116-marcado-ui-legacy/goldens-before.txt --reason "suites vivas antes de borrar el legacy" --root . 2) grep -rnE "AnnotationPopup|AnnotationsList|DocumentViewer|DocumentSidebar|useAnnotation|/types[\"']|utils/frontmatter" src : todas las coincidencias deben estar en los 14 archivos de la lista; si no, aplicar la regla de parada del scope. 3) git rm de los 14 archivos. 4) Repetir el comando del paso 1 hacia goldens-after.txt y comparar: los mismos 4 archivos, 23 tests pasados y 0 fallidos. 5) npm run build. 6) TMPDIR=/dev/shm npx vitest run completo.

## Validation

_List the checks required before this task can close._

- cd /mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run
- cd /mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui && npm run build
- cd /mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui && ! grep -rnE "AnnotationPopup|AnnotationsList|DocumentViewer|DocumentSidebar|useAnnotation|utils/frontmatter" src

## Done When

_Name the observable condition that makes the task complete._

Los 14 archivos ya no están en HEAD (salvo los que haya retenido la regla de parada, anotados en result-summary.md). El grep del paso 2 no devuelve nada en src/. goldens-after.txt muestra 4 archivos y 23 tests pasados, igual que goldens-before.txt. npm run build termina con exit 0. npx vitest run completo informa 4 archivos de test y 23 tests, todos pasados (antes eran 10 archivos y 85 tests).

FILE:desk/rituals/execution.md
---
id: ritual-execution
steps: []
tags:
- workspace:desk
---

# Execution ritual

Review the board, bind the relevant pills, keep scope tight, and implement only the active task for marcado-ui.

FILE:desk/rituals/testing.md
---
id: ritual-testing
steps: []
tags:
- workspace:desk
---

# Testing ritual

Run the smallest relevant validation first, then broaden coverage when marcado-ui changes shared behavior.

FILE:desk/rituals/closeout.md
---
id: ritual-closeout
steps: []
tags:
- workspace:desk
---

# Closeout ritual

Close a marcado-ui task only after validation passes, the board is updated, and the final change is ready to commit.

FILE:src/components/AnnotationPopup.tsx
import { useState, useEffect, useRef } from "react";
import { FiX, FiSave, FiEdit3 } from "react-icons/fi";

interface AnnotationPopupProps {
  show: boolean;
  selectedText: string;
  position: { x: number; y: number } | null;
  initialNote?: string;
  isEditing?: boolean;
  onSave: (note: string) => void;
  onCancel: () => void;
}

export default function AnnotationPopup({
  show,
  selectedText,
  position,
  initialNote = "",
  isEditing = false,
  onSave,
  onCancel,
}: AnnotationPopupProps) {
  const [note, setNote] = useState(initialNote);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (show) {
      setNote(initialNote);
    }
  }, [show, initialNote]);

  useEffect(() => {
    if (show && textareaRef.current) {
      textareaRef.current.focus();
      if (isEditing) {
        textareaRef.current.select();
      }
    }
  }, [show, isEditing]);

  if (!show || !position) return null;

  const handleSave = () => {
    if (note.trim()) {
      onSave(note.trim());
      setNote("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <div
      className="fixed z-50 w-72 bg-surface border border-border rounded-xl shadow-xl"
      style={{
        left: Math.min(position.x, window.innerWidth - 300),
        top: Math.min(position.y, window.innerHeight - 220),
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-medium text-muted flex items-center gap-1.5">
          {isEditing ? (
            <><FiEdit3 className="w-3 h-3" /> Edit Annotation</>
          ) : (
            "Add Annotation"
          )}
        </span>
        <button
          onClick={onCancel}
          className="p-0.5 rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
          aria-label="Cancel"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selected text preview */}
      <div className="px-3 py-2">
        <p className="text-xs text-muted mb-1">Selected text:</p>
        <p className="text-xs text-foreground bg-background rounded px-2 py-1.5 line-clamp-2 leading-relaxed">
          &ldquo;{selectedText}&rdquo;
        </p>
      </div>

      {/* Note input */}
      <div className="px-3 pb-2">
        <textarea
          ref={textareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a note about this selection..."
          rows={3}
          className="w-full text-sm bg-background border border-border rounded-lg px-2.5 py-2 text-foreground placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all duration-200"
        />
      </div>

      {/* Save button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleSave}
          disabled={!note.trim()}
          className="w-full flex items-center justify-center gap-1.5 text-sm font-medium py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          <FiSave className="w-3.5 h-3.5" />
          {isEditing ? "Update Annotation" : "Save Annotation"}
        </button>
      </div>
    </div>
  );
}

FILE:src/components/AnnotationsList.tsx
import { FiTrash2, FiMessageSquare, FiEdit3 } from "react-icons/fi";
import type { Annotation } from "../types";

interface AnnotationsListProps {
  annotations: Annotation[];
  onDelete: (id: string) => void;
  onEdit?: (annotation: Annotation) => void;
  onScrollTo: (annotation: Annotation) => void;
}

export default function AnnotationsList({
  annotations,
  onDelete,
  onEdit,
  onScrollTo,
}: AnnotationsListProps) {
  if (annotations.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <FiMessageSquare className="w-8 h-8 text-muted/30 mx-auto mb-2" />
        <p className="text-sm text-muted/60">
          Select text in the document to add your first annotation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {annotations.map((ann) => (
        <AnnotationItem
          key={ann.id}
          annotation={ann}
          onDelete={onDelete}
          onEdit={onEdit}
          onScrollTo={onScrollTo}
        />
      ))}
    </div>
  );
}

function AnnotationItem({
  annotation: ann,
  onDelete,
  onEdit,
  onScrollTo,
}: {
  annotation: Annotation;
  onDelete: (id: string) => void;
  onEdit?: (annotation: Annotation) => void;
  onScrollTo: (annotation: Annotation) => void;
}) {
  const handleClick = () => onScrollTo(ann);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onScrollTo(ann);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(ann);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(ann.id);
  };

  const formattedDate = new Date(ann.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="w-full text-left p-3 rounded-lg bg-background/50 border border-border hover:border-primary/30 hover:bg-surface-hover transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-xs text-foreground font-medium leading-snug line-clamp-2 flex-1">
          {'\u201C'}{ann.selectedText}{'\u201D'}
        </p>
        <div className="flex items-center gap-0.5 shrink-0">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-1 rounded text-muted/50 hover:text-secondary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              aria-label="Edit annotation"
            >
              <FiEdit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 rounded text-muted/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            aria-label="Delete annotation"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs text-muted/70 line-clamp-1 mb-1">
        {ann.note}
      </p>
      <p className="text-xs text-muted/40">
        {formattedDate}
      </p>
    </div>
  );
}

FILE:src/components/DocumentViewer.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Document, Annotation } from "../types";
import { FiFileText } from "react-icons/fi";
import AnnotationsList from "./AnnotationsList";

const statusColors: Record<string, string> = {
  published: "text-success bg-success/10 border-success/30",
  review: "text-warning bg-warning/10 border-warning/30",
  draft: "text-muted bg-muted/10 border-muted/30",
};

interface DocumentViewerProps {
  document: Document | null;
  annotations: Annotation[];
  contentRef: React.RefObject<HTMLDivElement | null>;
  onDeleteAnnotation?: (id: string) => void;
  onEditAnnotation?: (annotation: Annotation) => void;
  onScrollToAnnotation?: (annotation: Annotation) => void;
}

export default function DocumentViewer({
  document,
  annotations,
  contentRef,
  onDeleteAnnotation,
  onEditAnnotation,
  onScrollToAnnotation,
}: DocumentViewerProps) {
  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center max-w-xs">
          <FiFileText className="w-12 h-12 text-muted/40 mx-auto mb-4" />
          <p className="text-muted text-base">Select a document to view</p>
          <p className="text-muted/50 text-sm mt-1">
            Browse your documents from the sidebar and start annotating
          </p>
        </div>
      </div>
    );
  }

  const { frontmatter } = document;

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-background h-full overflow-hidden">
      {/* Document content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div ref={contentRef} className="prose-content max-w-3xl mx-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {document.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Metadata + annotations sidebar */}
      <aside className="w-full lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-surface overflow-y-auto">
        <div className="p-4 space-y-5">
          {/* Title */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Metadata
            </h3>
            <h2 className="text-base font-heading font-semibold text-foreground leading-snug">
              {frontmatter.title}
            </h2>
          </div>

          {/* Status, Date, Tags */}
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted block mb-1">Status</span>
              <span
                className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${
                  statusColors[frontmatter.status] || statusColors.draft
                }`}
              >
                {frontmatter.status}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted block mb-1">Date</span>
              <span className="text-sm text-foreground">
                {frontmatter.date}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted block mb-1.5">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {frontmatter.tags.length > 0 ? (
                  frontmatter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted/50">No tags</span>
                )}
              </div>
            </div>
          </div>

          {/* Separator */}
          <hr className="border-border" />

          {/* Annotations list */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
              Annotations
              <span className="text-[10px] font-normal text-muted bg-muted/20 px-1.5 py-0.5 rounded-full">
                {annotations.length}
              </span>
            </h3>
            <AnnotationsList
              annotations={annotations}
              onDelete={onDeleteAnnotation || (() => {})}
              onEdit={onEditAnnotation}
              onScrollTo={onScrollToAnnotation || (() => {})}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

FILE:src/components/DocumentSidebar.tsx
import { useState } from "react";
import type { Document } from "../types";
import { FiSearch } from "react-icons/fi";

interface DocumentSidebarProps {
  documents: Document[];
  selectedDocId: string | null;
  onSelect: (doc: Document) => void;
}

const statusColors: Record<string, string> = {
  published: "bg-success/20 text-success",
  review: "bg-warning/20 text-warning",
  draft: "bg-muted/30 text-muted",
};

export default function DocumentSidebar({
  documents,
  selectedDocId,
  onSelect,
}: DocumentSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = documents.filter((doc) => {
    const q = search.toLowerCase();
    return (
      doc.frontmatter.title.toLowerCase().includes(q) ||
      doc.frontmatter.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <aside className="w-72 shrink-0 bg-surface border-r border-border flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h2 className="text-lg font-heading font-semibold text-foreground mb-3">
          Documents
        </h2>
        <div className="relative">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search by title or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md bg-background border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all duration-200"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted text-center mt-8">
            {search ? "No matching documents" : "No documents available"}
          </p>
        ) : (
          filtered.map((doc) => {
            const selected = doc.id === selectedDocId;
            return (
              <button
                key={doc.id}
                onClick={() => onSelect(doc)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  selected
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-transparent border border-transparent hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className={`text-sm font-medium leading-snug ${
                      selected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {doc.frontmatter.title}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                      statusColors[doc.frontmatter.status] || statusColors.draft
                    }`}
                  >
                    {doc.frontmatter.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-muted">
                    {doc.frontmatter.date}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {doc.frontmatter.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 rounded bg-muted/20 text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.frontmatter.tags.length > 3 && (
                    <span className="text-xs text-muted">
                      +{doc.frontmatter.tags.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
}

FILE:src/hooks/useAnnotations.ts
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

FILE:src/hooks/useAnnotationHighlights.ts
import { useEffect, useRef } from "react";
import type { Annotation } from "../types";

interface UseAnnotationHighlightsOptions {
  contentRef: React.RefObject<HTMLDivElement | null>;
  annotations: Annotation[];
  contentKey?: string;
  onAnnotationClick: (annotation: Annotation) => void;
  onAnnotationEdit?: (annotation: Annotation) => void;
  onAnnotationDelete?: (annotationId: string) => void;
}

interface TextSegment {
  node: Text;
  start: number;
  end: number;
}

function getTextSegments(root: Node): TextSegment[] {
  const segments: TextSegment[] = [];
  let offset = 0;

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const len = (node.textContent || "").length;
      if (len > 0) {
        segments.push({ node: node as Text, start: offset, end: offset + len });
        offset += len;
      }
      return;
    }
    if (
      node instanceof HTMLElement &&
      node.tagName === "MARK" &&
      node.dataset.annotationId
    ) {
      const len = (node.textContent || "").length;
      if (len > 0) {
        offset += len;
      }
      return;
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      walk(node.childNodes[i]);
    }
  }

  walk(root);
  return segments;
}

function findSegmentAt(
  segments: TextSegment[],
  offset: number
): { segment: TextSegment; localOffset: number } | null {
  for (const seg of segments) {
    if (offset >= seg.start && offset <= seg.end) {
      return { segment: seg, localOffset: offset - seg.start };
    }
  }
  return null;
}

export function useAnnotationHighlights({
  contentRef,
  annotations,
  contentKey = "",
  onAnnotationClick,
  onAnnotationEdit,
  onAnnotationDelete,
}: UseAnnotationHighlightsOptions) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Cleanup tooltip on unmount
  useEffect(() => {
    return () => {
      tooltipRef.current?.remove();
      tooltipRef.current = null;
    };
  }, []);

  // Inject / re-inject <mark> highlights into the content DOM
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    let isApplying = false;

    function applyMarks() {
      if (isApplying) return;
      isApplying = true;

      try {
        // Remove any existing marks
        const existingMarks = container.querySelectorAll<HTMLElement>(
          "mark[data-annotation-id]"
        );
        for (const mark of existingMarks) {
          const textNode = document.createTextNode(mark.textContent || "");
          mark.parentNode?.replaceChild(textNode, mark);
        }

        container.normalize();

        if (annotations.length === 0) return;

        const segments = getTextSegments(container);
        if (segments.length === 0) return;

        const sorted = [...annotations].sort(
          (a, b) => a.startOffset - b.startOffset
        );

        for (const ann of sorted) {
          const startInfo = findSegmentAt(segments, ann.startOffset);
          const endInfo = findSegmentAt(segments, ann.endOffset);
          if (!startInfo || !endInfo) continue;

          const { segment: startSeg, localOffset: localStart } = startInfo;
          const { segment: endSeg, localOffset: localEnd } = endInfo;

          if (startSeg.node !== endSeg.node) continue;

          const node = startSeg.node;
          const text = node.textContent || "";

          if (localStart < 0 || localEnd > text.length || localStart >= localEnd)
            continue;

          const afterText = document.createTextNode(text.slice(localEnd));
          const highlightText = document.createTextNode(
            text.slice(localStart, localEnd)
          );
          const beforeText = document.createTextNode(text.slice(0, localStart));

          const mark = document.createElement("mark");
          mark.className = "annotation-highlight";
          mark.dataset.annotationId = ann.id;
          mark.appendChild(highlightText);

          const parent = node.parentNode;
          if (!parent) continue;

          parent.insertBefore(beforeText, node);
          parent.insertBefore(mark, node);
          parent.insertBefore(afterText, node);
          parent.removeChild(node);

          const shift =
            (beforeText.textContent?.length || 0) +
            (mark.textContent?.length || 0) +
            (afterText.textContent?.length || 0) -
            text.length;
          for (const seg of segments) {
            if (seg.start > ann.startOffset) {
              seg.start += shift;
              seg.end += shift;
            }
          }
        }
      } finally {
        isApplying = false;
      }
    }

    // Initial application
    applyMarks();

    // Watch for ReactMarkdown re-renders that wipe out marks
    const observer = new MutationObserver(() => {
      if (annotations.length === 0) return;
      const existingMarkIds = new Set(
        Array.from(
          container.querySelectorAll<HTMLElement>("mark[data-annotation-id]")
        ).map((el) => el.dataset.annotationId || "")
      );
      const hasAllMarks = annotations.every((a) => existingMarkIds.has(a.id));
      if (!hasAllMarks) {
        applyMarks();
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [annotations, contentRef, contentKey]);

  // Click handler — opens edit popup on mark click
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "MARK" && target.dataset.annotationId) {
        const ann = annotations.find(
          (a) => a.id === target.dataset.annotationId
        );
        if (ann) {
          e.stopPropagation();
          if (onAnnotationEdit) {
            onAnnotationEdit(ann);
          } else {
            onAnnotationClick(ann);
          }
        }
      }
    };

    container.addEventListener("click", handler);
    return () => container.removeEventListener("click", handler);
  }, [contentRef, annotations, onAnnotationClick, onAnnotationEdit]);

  // Tooltip on hover
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    let tooltip = tooltipRef.current;
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "annotation-tooltip";
      tooltip.style.cssText = `
        position: fixed;
        z-index: 100;
        display: none;
        background: oklch(0.205 0.008 285.82);
        border: 1px solid oklch(0.279 0.015 285.82);
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 12px;
        max-width: 260px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        pointer-events: auto;
      `;
      document.body.appendChild(tooltip);
      tooltipRef.current = tooltip;
    }

    const showTooltip = (e: MouseEvent, ann: Annotation) => {
      if (!tooltip) return;

      const noteText = ann.note || "No note";
      const escapedNote = noteText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      tooltip.innerHTML = `
        <div style="margin-bottom:6px;color:oklch(0.707 0.018 285.82);word-break:break-word;line-height:1.4;">
          ${escapedNote}
        </div>
        <div style="display:flex;gap:6px;">
          <button class="tt-edit" data-id="${ann.id}" style="flex:1;padding:4px 8px;border-radius:6px;border:1px solid oklch(0.546 0.245 262.88);background:oklch(0.546 0.245 262.88 / 0.15);color:oklch(0.707 0.165 254.62);cursor:pointer;font-size:11px;font-weight:500;transition:all 0.15s;">
            Edit
          </button>
          <button class="tt-delete" data-id="${ann.id}" style="flex:1;padding:4px 8px;border-radius:6px;border:1px solid oklch(0.577 0.215 27.33);background:oklch(0.577 0.215 27.33 / 0.15);color:oklch(0.577 0.215 27.33);cursor:pointer;font-size:11px;font-weight:500;transition:all 0.15s;">
            Delete
          </button>
        </div>
      `;

      const pad = 8;
      let left = e.clientX - 130;
      let top = e.clientY - 10;

      const tw = 260;
      const th = tooltip.offsetHeight || 100;
      if (left + tw > window.innerWidth - pad) {
        left = window.innerWidth - tw - pad;
      }
      if (left < pad) left = pad;
      if (top + th > window.innerHeight - pad) {
        top = e.clientY - th - 10;
      }
      if (top < pad) top = pad;

      tooltip.style.left = left + "px";
      tooltip.style.top = top + "px";
      tooltip.style.display = "block";
    };

    const hideTooltip = () => {
      if (tooltip) {
        tooltip.style.display = "none";
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "MARK" && target.dataset.annotationId) {
        const ann = annotations.find(
          (a) => a.id === target.dataset.annotationId
        );
        if (ann) {
          showTooltip(e, ann);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "MARK" && target.dataset.annotationId) {
        const ann = annotations.find(
          (a) => a.id === target.dataset.annotationId
        );
        if (ann && tooltip && tooltip.style.display === "block") {
          const pad = 8;
          let left = e.clientX - 130;
          let top = e.clientY - 10;
          const tw = 260;
          const th = tooltip.offsetHeight || 100;
          if (left + tw > window.innerWidth - pad) {
            left = window.innerWidth - tw - pad;
          }
          if (left < pad) left = pad;
          if (top + th > window.innerHeight - pad) {
            top = e.clientY - th - 10;
          }
          if (top < pad) top = pad;
          tooltip.style.left = left + "px";
          tooltip.style.top = top + "px";
        }
      } else if (tooltip && !tooltip.contains(e.target as Node)) {
        hideTooltip();
      }
    };

    const handleTooltipClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("tt-edit") && target.dataset.id) {
        const ann = annotations.find((a) => a.id === target.dataset.id);
        if (ann && onAnnotationEdit) {
          onAnnotationEdit(ann);
          hideTooltip();
        }
      } else if (target.classList.contains("tt-delete") && target.dataset.id) {
        if (onAnnotationDelete) {
          onAnnotationDelete(target.dataset.id);
          hideTooltip();
        }
      }
    };

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleTooltipClick);
    container.addEventListener("mouseleave", hideTooltip);

    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleTooltipClick);
      container.removeEventListener("mouseleave", hideTooltip);
      tooltip?.remove();
      tooltipRef.current = null;
    };
  }, [contentRef, annotations, onAnnotationEdit, onAnnotationDelete]);
}

FILE:src/types.ts
export interface Frontmatter {
  title: string;
  tags: string[];
  date: string;
  status: "draft" | "review" | "published";
}

export interface Document {
  id: string;
  slug: string;
  content: string;
  frontmatter: Frontmatter;
}

export interface Annotation {
  id: string;
  docId: string;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  note: string;
  createdAt: string;
}

FILE:src/utils/frontmatter.ts
/**
 * Lightweight YAML frontmatter parser for the browser.
 * Handles simple key-value pairs and arrays (the formats used in this project).
 * No Node.js dependencies — works in any browser environment.
 */

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n?---\n?/;

function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const line of yaml.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value: unknown = trimmed.slice(colonIndex + 1).trim();

    // Handle arrays: ["item1", "item2", ...]
    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((item: string) => item.trim().replace(/^["']|["']$/g, ""));
    } else if (typeof value === "string") {
      // Handle quoted strings
      value = value.replace(/^["']|["']$/g, "");
    }

    data[key] = value;
  }

  return data;
}

export interface ParsedFrontmatter {
  data: Record<string, unknown>;
  content: string;
}

/**
 * Parse frontmatter from markdown content.
 * Returns the parsed frontmatter data and the remaining content body.
 */
export function parseFrontmatter(content: string): ParsedFrontmatter {
  const match = content.match(FRONTMATTER_REGEX);

  if (!match) {
    return { data: {}, content };
  }

  const frontmatterStr = match[1];
  const body = content.slice(match[0].length);
  const data = parseSimpleYaml(frontmatterStr);

  return { data, content: body };
}

FILE:src/__tests__/annotationPopup.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnnotationPopup from '../components/AnnotationPopup';

describe('AnnotationPopup', () => {
  const defaultProps = {
    show: true,
    selectedText: 'some highlighted text',
    position: { x: 200, y: 300 },
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // NODE-13: Renders when show and position provided
  it('should render when show is true and position is provided', () => {
    render(<AnnotationPopup {...defaultProps} />);
    expect(screen.getByText('Add Annotation')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Write a note about this selection...')
    ).toBeInTheDocument();
    expect(screen.getByText('Selected text:')).toBeInTheDocument();
    expect(
      screen.getByText(/“some highlighted text”/)
    ).toBeInTheDocument();
  });

  // NODE-13: Hidden when show is false
  it('should not render when show is false', () => {
    render(<AnnotationPopup {...defaultProps} show={false} />);
    expect(screen.queryByText('Add Annotation')).not.toBeInTheDocument();
  });

  // NODE-13: Hidden when position is null
  it('should not render when position is null', () => {
    render(<AnnotationPopup {...defaultProps} position={null} />);
    expect(screen.queryByText('Add Annotation')).not.toBeInTheDocument();
  });

  // NODE-13: Save button disabled when textarea empty
  it('should have save button disabled when note is empty', () => {
    render(<AnnotationPopup {...defaultProps} />);
    const saveButton = screen.getByRole('button', { name: /save annotation/i });
    expect(saveButton).toBeDisabled();
  });

  // NODE-13: Save button enabled when textarea has text
  it('should enable save button when note is non-empty', async () => {
    const user = userEvent.setup();
    render(<AnnotationPopup {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );

    await user.type(textarea, 'my annotation note');

    const saveButton = screen.getByRole('button', { name: /save annotation/i });
    expect(saveButton).not.toBeDisabled();
  });

  // NODE-13: Save calls onSave with note text
  it('should call onSave with trimmed note when save is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AnnotationPopup {...defaultProps} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );
    await user.type(textarea, 'my annotation note');
    await user.click(screen.getByRole('button', { name: /save annotation/i }));

    expect(onSave).toHaveBeenCalledWith('my annotation note');
  });

  // NODE-13: Save ignores empty/whitespace notes
  it('should not call onSave with whitespace-only note', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AnnotationPopup {...defaultProps} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );
    await user.type(textarea, '   ');
    await user.click(screen.getByRole('button', { name: /save annotation/i }));

    expect(onSave).not.toHaveBeenCalled();
  });

  // NODE-13: Cancel button calls onCancel
  it('should call onCancel when X button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<AnnotationPopup {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByLabelText('Cancel'));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  // NODE-13: Escape key calls onCancel
  it('should call onCancel when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<AnnotationPopup {...defaultProps} onCancel={onCancel} />);

    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );
    await user.type(textarea, '{Escape}');

    expect(onCancel).toHaveBeenCalledOnce();
  });

  // NODE-13: Cmd+Enter calls save
  it('should call onSave when Cmd+Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AnnotationPopup {...defaultProps} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );
    await user.type(textarea, 'a note');
    await user.keyboard('{Meta>}{Enter}{/Meta}');

    expect(onSave).toHaveBeenCalledWith('a note');
  });

  // NODE-13: Ctrl+Enter calls save
  it('should call onSave when Ctrl+Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AnnotationPopup {...defaultProps} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );
    await user.type(textarea, 'ctrl-enter note');
    await user.keyboard('{Control>}{Enter}{/Control}');

    expect(onSave).toHaveBeenCalledWith('ctrl-enter note');
  });

  // NODE-13: Position is clamped to viewport
  it('should be positioned within viewport boundaries', () => {
    const position = { x: 99999, y: 99999 };
    render(
      <AnnotationPopup
        {...defaultProps}
        position={position}
      />
    );

    const popup = screen.getByText('Add Annotation').closest('div.fixed');
    expect(popup).toBeInTheDocument();
    // Position should be clamped — left should not exceed window width
    const left = parseInt(popup?.getAttribute('style') || '').toString();
    // Just check it renders without error (the Math.min clamping works)
    expect(popup?.getAttribute('style')).toContain('left:');
  });
});

FILE:src/__tests__/annotationsList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnnotationsList from '../components/AnnotationsList';
import type { Annotation } from '../types';

const sampleAnnotations: Annotation[] = [
  {
    id: 'ann-1',
    docId: 'doc-1',
    selectedText: 'first selection',
    startOffset: 0,
    endOffset: 15,
    note: 'my first annotation note',
    createdAt: '2025-01-15T10:30:00.000Z',
  },
  {
    id: 'ann-2',
    docId: 'doc-1',
    selectedText: 'second selection',
    startOffset: 20,
    endOffset: 36,
    note: 'another annotation',
    createdAt: '2025-02-20T14:45:00.000Z',
  },
];

describe('AnnotationsList', () => {
  const defaultProps = {
    annotations: sampleAnnotations,
    onDelete: vi.fn(),
    onScrollTo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // NODE-16: Empty state
  it('should show empty state when there are no annotations', () => {
    render(
      <AnnotationsList
        annotations={[]}
        onDelete={vi.fn()}
        onScrollTo={vi.fn()}
      />
    );
    expect(
      screen.getByText(
        'Select text in the document to add your first annotation'
      )
    ).toBeInTheDocument();
  });

  // NODE-15: Renders annotation cards
  it('should render all annotation cards', () => {
    render(<AnnotationsList {...defaultProps} />);
    expect(screen.getByText(/“first selection”/)).toBeInTheDocument();
    expect(screen.getByText(/“second selection”/)).toBeInTheDocument();
    expect(screen.getByText('my first annotation note')).toBeInTheDocument();
    expect(screen.getByText('another annotation')).toBeInTheDocument();
  });

  // NODE-15: Date formatted correctly
  it('should render formatted date for each annotation', () => {
    render(<AnnotationsList {...defaultProps} />);
    // Jan 15, 2025
    expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
  });

  // NODE-15: onScrollTo called when card is clicked
  it('should call onScrollTo when annotation card is clicked', async () => {
    const user = userEvent.setup();
    const onScrollTo = vi.fn();
    render(
      <AnnotationsList
        annotations={sampleAnnotations}
        onDelete={vi.fn()}
        onScrollTo={onScrollTo}
      />
    );

    await user.click(screen.getByText(/“first selection”/));
    expect(onScrollTo).toHaveBeenCalledWith(sampleAnnotations[0]);
  });

  // NODE-15: Delete button calls onDelete with correct id
  it('should call onDelete with annotation id when delete is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <AnnotationsList
        annotations={sampleAnnotations}
        onDelete={onDelete}
        onScrollTo={vi.fn()}
      />
    );

    // Delete buttons are only visible on hover (opacity: 0 → 1)
    // But they still exist in the DOM and can be clicked
    const deleteButtons = screen.getAllByLabelText('Delete annotation');
    expect(deleteButtons).toHaveLength(2);

    await user.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith('ann-1');
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  // NODE-15: Clicking delete does not trigger onScrollTo (stopPropagation)
  it('should not trigger onScrollTo when delete is clicked', async () => {
    const user = userEvent.setup();
    const onScrollTo = vi.fn();
    const onDelete = vi.fn();
    render(
      <AnnotationsList
        annotations={sampleAnnotations.slice(0, 1)}
        onDelete={onDelete}
        onScrollTo={onScrollTo}
      />
    );

    await user.click(screen.getByLabelText('Delete annotation'));
    expect(onDelete).toHaveBeenCalled();
    expect(onScrollTo).not.toHaveBeenCalled();
  });

  // Annotation count in the list (tested via the parent, but check each item is rendered)
  it('should render all annotation items sequentially', () => {
    render(<AnnotationsList {...defaultProps} />);
    const items = screen.getAllByRole('button');
    // Each card is a button + each delete button is nested
    // The cards themselves are buttons
    expect(items.length).toBeGreaterThanOrEqual(2);
  });
});

FILE:src/__tests__/documentViewer.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DocumentViewer from '../components/DocumentViewer';
import type { Document, Annotation } from '../types';

const sampleDoc: Document = {
  id: 'doc-1',
  slug: 'project-architecture',
  content: '# Project Architecture Overview\n\nSome content here.',
  frontmatter: {
    title: 'Project Architecture Overview',
    tags: ['architecture', 'system-design'],
    date: '2024-12-15',
    status: 'published',
  },
};

const sampleAnnotations: Annotation[] = [
  {
    id: 'ann-1',
    docId: 'doc-1',
    selectedText: 'Project Architecture Overview',
    startOffset: 2,
    endOffset: 29,
    note: 'Important section',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

describe('DocumentViewer', () => {
  const contentRef = { current: null as HTMLDivElement | null };

  // NODE-08: Empty state when no document selected
  it('should render empty state when no document is selected', () => {
    render(
      <DocumentViewer
        document={null}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    expect(screen.getByText('Select a document to view')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Browse your documents from the sidebar and start annotating'
      )
    ).toBeInTheDocument();
  });

  // NODE-09: Document content renders
  it('should render document content when a document is selected', () => {
    render(
      <DocumentViewer
        document={sampleDoc}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    // react-markdown renders content
    expect(
      screen.getAllByText('Project Architecture Overview').length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Some content here.')).toBeInTheDocument();
  });

  // NODE-11: Metadata panel renders
  it('should render metadata panel with document details', () => {
    render(
      <DocumentViewer
        document={sampleDoc}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    expect(screen.getByText('Metadata')).toBeInTheDocument();
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('2024-12-15')).toBeInTheDocument();
    expect(screen.getByText('#architecture')).toBeInTheDocument();
    expect(screen.getByText('#system-design')).toBeInTheDocument();
  });

  // NODE-11: Annotation count displays
  it('should show annotation count in metadata', () => {
    render(
      <DocumentViewer
        document={sampleDoc}
        annotations={sampleAnnotations}
        contentRef={contentRef}
      />
    );
    expect(screen.getByRole('heading', { name: /annotations/i })).toHaveTextContent('1');
  });

  it('should show plural annotation count', () => {
    const manyAnnotations = [
      ...sampleAnnotations,
      {
        id: 'ann-2',
        docId: 'doc-1',
        selectedText: 'content',
        startOffset: 30,
        endOffset: 37,
        note: 'Another note',
        createdAt: '2025-01-02T00:00:00.000Z',
      },
    ];
    render(
      <DocumentViewer
        document={sampleDoc}
        annotations={manyAnnotations}
        contentRef={contentRef}
      />
    );
    expect(screen.getByRole('heading', { name: /annotations/i })).toHaveTextContent('2');
  });

  // NODE-11: No tags edge case
  it('should show "No tags" when document has no tags', () => {
    const docNoTags: Document = {
      ...sampleDoc,
      frontmatter: { ...sampleDoc.frontmatter, tags: [] },
    };
    render(
      <DocumentViewer
        document={docNoTags}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    expect(screen.getByText('No tags')).toBeInTheDocument();
  });

  // Status badge variant colors
  it('should render status badge with correct styling for published', () => {
    render(
      <DocumentViewer
        document={sampleDoc}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    const badge = screen.getByText('published');
    expect(badge.className).toContain('text-success');
  });

  it('should render status badge with correct styling for draft', () => {
    const draftDoc: Document = {
      ...sampleDoc,
      frontmatter: { ...sampleDoc.frontmatter, status: 'draft' },
    };
    render(
      <DocumentViewer
        document={draftDoc}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    const badge = screen.getByText('draft');
    expect(badge.className).toContain('text-muted');
  });

  it('should render status badge with correct styling for review', () => {
    const reviewDoc: Document = {
      ...sampleDoc,
      frontmatter: { ...sampleDoc.frontmatter, status: 'review' },
    };
    render(
      <DocumentViewer
        document={reviewDoc}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    const badge = screen.getByText('review');
    expect(badge.className).toContain('text-warning');
  });
});

FILE:src/__tests__/sidebar.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentSidebar from '../components/DocumentSidebar';
import type { Document } from '../types';

// Sample documents for testing
const sampleDocs: Document[] = [
  {
    id: 'doc-1',
    slug: 'project-architecture',
    content: '# Architecture',
    frontmatter: {
      title: 'Project Architecture Overview',
      tags: ['architecture', 'system-design'],
      date: '2024-12-15',
      status: 'published',
    },
  },
  {
    id: 'doc-2',
    slug: 'research-state-management',
    content: '# State Management',
    frontmatter: {
      title: 'Research: State Management',
      tags: ['react', 'state-management', 'frontend'],
      date: '2024-12-10',
      status: 'review',
    },
  },
  {
    id: 'doc-3',
    slug: 'draft-note',
    content: '# Draft',
    frontmatter: {
      title: 'Unfinished Draft Note',
      tags: ['draft', 'ideas'],
      date: '2024-11-01',
      status: 'draft',
    },
  },
];

describe('DocumentSidebar', () => {
  const defaultProps = {
    documents: sampleDocs,
    selectedDocId: null,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // NODE-01: Sidebar renders
  it('should render the sidebar with heading and search input', () => {
    render(<DocumentSidebar {...defaultProps} />);
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search by title or tag...')
    ).toBeInTheDocument();
  });

  // NODE-03: Document cards render
  it('should render all document cards', () => {
    render(<DocumentSidebar {...defaultProps} />);
    expect(
      screen.getByText('Project Architecture Overview')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Research: State Management')
    ).toBeInTheDocument();
    expect(screen.getByText('Unfinished Draft Note')).toBeInTheDocument();
  });

  // NODE-04: Status badges render with correct text
  it('should render status badges for each document', () => {
    render(<DocumentSidebar {...defaultProps} />);
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('review')).toBeInTheDocument();
    expect(screen.getAllByText('draft').length).toBeGreaterThan(0);
  });

  // Tag chips render
  it('should render tag chips for each document', () => {
    render(<DocumentSidebar {...defaultProps} />);
    expect(screen.getByText('architecture')).toBeInTheDocument();
    expect(screen.getByText('system-design')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('state-management')).toBeInTheDocument();
    expect(screen.getAllByText('draft').length).toBeGreaterThan(0);
    expect(screen.getByText('ideas')).toBeInTheDocument();
  });

  // EDGE: Tags overflow (>3 tags)
  it('should show +N for documents with more than 3 tags', () => {
    const docWithManyTags: Document = {
      id: 'many-tags',
      slug: 'many-tags',
      content: '# Many tags',
      frontmatter: {
        title: 'Many Tags Doc',
        tags: ['a', 'b', 'c', 'd', 'e'],
        date: '2024-01-01',
        status: 'draft',
      },
    };
    render(
      <DocumentSidebar
        documents={[docWithManyTags]}
        selectedDocId={null}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  // NODE-02.search-focused: Search filters by title
  it('should filter documents by title', async () => {
    const user = userEvent.setup();
    render(<DocumentSidebar {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by title or tag...');

    await user.type(search, 'architecture');

    expect(
      screen.getByText('Project Architecture Overview')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Research: State Management')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Unfinished Draft Note')).not.toBeInTheDocument();
  });

  // NODE-02: Search filters by tag
  it('should filter documents by tag', async () => {
    const user = userEvent.setup();
    render(<DocumentSidebar {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by title or tag...');

    await user.type(search, 'frontend');

    expect(
      screen.getByText('Research: State Management')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Project Architecture Overview')
    ).not.toBeInTheDocument();
  });

  // NODE-05: Empty state when no match
  it('should show empty state when search matches nothing', async () => {
    const user = userEvent.setup();
    render(<DocumentSidebar {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by title or tag...');

    await user.type(search, 'xyznonexistent');

    expect(screen.getByText('No matching documents')).toBeInTheDocument();
  });

  // NODE-05: Empty state when no documents
  it('should show empty state when documents array is empty', () => {
    render(
      <DocumentSidebar
        documents={[]}
        selectedDocId={null}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText('No documents available')).toBeInTheDocument();
  });

  // NODE-03: Clear search restores all documents
  it('should restore all documents when search is cleared', async () => {
    const user = userEvent.setup();
    render(<DocumentSidebar {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by title or tag...');

    await user.type(search, 'architecture');
    expect(
      screen.queryByText('Research: State Management')
    ).not.toBeInTheDocument();

    await user.clear(search);
    expect(
      screen.getByText('Research: State Management')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Project Architecture Overview')
    ).toBeInTheDocument();
  });

  // NODE-03: Click calls onSelect
  it('should call onSelect when a document card is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <DocumentSidebar
        documents={sampleDocs}
        selectedDocId={null}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByText('Project Architecture Overview'));
    expect(onSelect).toHaveBeenCalledWith(sampleDocs[0]);
  });

  // NODE-03: Selected state shows different style
  it('should apply selected styles to the active document', () => {
    render(
      <DocumentSidebar
        documents={sampleDocs}
        selectedDocId="doc-1"
        onSelect={vi.fn()}
      />
    );
    const selectedButton = screen.getByText(
      'Project Architecture Overview'
    ).closest('button');
    expect(selectedButton?.className).toContain('bg-primary/10');
  });

  // Search with special regex chars (boundary)
  it('should handle search with special regex characters', async () => {
    const user = userEvent.setup();
    render(<DocumentSidebar {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by title or tag...');

    fireEvent.change(search, { target: { value: '[.*+?^${}()|\\]' } });

    expect(screen.getByText('No matching documents')).toBeInTheDocument();
  });

  // Date is rendered
  it('should render the date for each document', () => {
    render(<DocumentSidebar {...defaultProps} />);
    expect(screen.getByText('2024-12-15')).toBeInTheDocument();
    expect(screen.getByText('2024-12-10')).toBeInTheDocument();
    expect(screen.getByText('2024-11-01')).toBeInTheDocument();
  });

  // cursor-pointer on document cards
  it('document cards should have cursor-pointer class', () => {
    render(<DocumentSidebar {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn.className).toContain('cursor-pointer');
    });
  });
});

FILE:src/__tests__/useAnnotations.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnnotations } from '../hooks/useAnnotations';
import type { Annotation } from '../types';

const STORAGE_PREFIX = 'annotations-';

describe('useAnnotations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with an empty list for a new docId', () => {
    const { result } = renderHook(() => useAnnotations('doc-1'));
    expect(result.current.annotations).toEqual([]);
  });

  it('should return empty array when docId is null', () => {
    const { result } = renderHook(() => useAnnotations(null));
    expect(result.current.annotations).toEqual([]);
  });

  it('should add an annotation and persist it', () => {
    const { result } = renderHook(() => useAnnotations('doc-1'));

    act(() => {
      result.current.addAnnotation('selected text', 0, 14, 'my note');
    });

    expect(result.current.annotations).toHaveLength(1);
    expect(result.current.annotations[0].selectedText).toBe('selected text');
    expect(result.current.annotations[0].note).toBe('my note');
    expect(result.current.annotations[0].startOffset).toBe(0);
    expect(result.current.annotations[0].endOffset).toBe(14);
    expect(result.current.annotations[0].docId).toBe('doc-1');
    expect(result.current.annotations[0].id).toMatch(/^ann-/);
    expect(result.current.annotations[0].createdAt).toBeTruthy();
  });

  it('should persist annotations to localStorage', () => {
    const { result } = renderHook(() => useAnnotations('doc-persist'));

    act(() => {
      result.current.addAnnotation('text', 0, 4, 'note');
    });

    const stored = JSON.parse(
      localStorage.getItem(`${STORAGE_PREFIX}doc-persist`) || '[]'
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].selectedText).toBe('text');
  });

  it('should load existing annotations from localStorage on mount', () => {
    const existing: Annotation[] = [
      {
        id: 'ann-pre-1',
        docId: 'doc-2',
        selectedText: 'pre-existing',
        startOffset: 0,
        endOffset: 12,
        note: 'loaded note',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem(`${STORAGE_PREFIX}doc-2`, JSON.stringify(existing));

    const { result } = renderHook(() => useAnnotations('doc-2'));
    expect(result.current.annotations).toHaveLength(1);
    expect(result.current.annotations[0].selectedText).toBe('pre-existing');
    expect(result.current.annotations[0].note).toBe('loaded note');
  });

  it('should delete an annotation', () => {
    const { result } = renderHook(() => useAnnotations('doc-del'));

    act(() => {
      result.current.addAnnotation('text-1', 0, 6, 'note 1');
    });
    act(() => {
      result.current.addAnnotation('text-2', 10, 16, 'note 2');
    });
    expect(result.current.annotations).toHaveLength(2);

    const idToDelete = result.current.annotations[0].id;
    act(() => {
      result.current.deleteAnnotation(idToDelete);
    });

    expect(result.current.annotations).toHaveLength(1);
    expect(result.current.annotations[0].selectedText).toBe('text-2');
  });

  it('should handle deletion of non-existent annotation gracefully', () => {
    const { result } = renderHook(() => useAnnotations('doc-foo'));

    act(() => {
      result.current.addAnnotation('text', 0, 4, 'note');
    });
    expect(result.current.annotations).toHaveLength(1);

    act(() => {
      result.current.deleteAnnotation('non-existent-id');
    });

    expect(result.current.annotations).toHaveLength(1);
  });

  it('should handle malformed localStorage data gracefully', () => {
    localStorage.setItem(`${STORAGE_PREFIX}doc-corrupt`, '{invalid json here');

    const { result } = renderHook(() => useAnnotations('doc-corrupt'));
    expect(result.current.annotations).toEqual([]);
  });

  it('should reload annotations when docId changes', () => {
    const { result, rerender } = renderHook(
      (docId: string | null) => useAnnotations(docId),
      { initialProps: 'doc-a' }
    );

    act(() => {
      result.current.addAnnotation('text-a', 0, 6, 'note a');
    });
    expect(result.current.annotations).toHaveLength(1);

    // Also add annotations for doc-b directly
    const docBAnnotations: Annotation[] = [
      {
        id: 'ann-b-1',
        docId: 'doc-b',
        selectedText: 'text-b',
        startOffset: 0,
        endOffset: 6,
        note: 'note b',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem(
      `${STORAGE_PREFIX}doc-b`,
      JSON.stringify(docBAnnotations)
    );

    rerender('doc-b');
    expect(result.current.annotations).toHaveLength(1);
    expect(result.current.annotations[0].selectedText).toBe('text-b');
  });

  it('should return null when adding annotation with null docId', () => {
    const { result } = renderHook(() => useAnnotations(null));

    let returned: Annotation | null = null;
    act(() => {
      returned = result.current.addAnnotation('text', 0, 4, 'note');
    });

    expect(returned).toBeNull();
    expect(result.current.annotations).toEqual([]);
  });

  it('should do nothing on delete when docId is null', () => {
    const { result } = renderHook(() => useAnnotations(null));

    act(() => {
      result.current.deleteAnnotation('some-id');
    });

    expect(result.current.annotations).toEqual([]);
  });
});

FILE:src/__tests__/utils.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseFrontmatter } from '../utils/frontmatter';

describe('parseFrontmatter', () => {
  it('should parse valid frontmatter with string values', () => {
    const md = `---
title: "My Title"
status: "draft"
date: "2024-01-01"
---
# Content body`;
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({
      title: 'My Title',
      status: 'draft',
      date: '2024-01-01',
    });
    expect(result.content).toBe('# Content body');
  });

  it('should parse frontmatter with array values', () => {
    const md = `---
title: "Test"
tags: ["react", "typescript", "testing"]
---
# Hello`;
    const result = parseFrontmatter(md);
    expect(result.data.tags).toEqual(['react', 'typescript', 'testing']);
  });

  it('should return empty data and full content when no frontmatter', () => {
    const md = '# Just a heading\n\nSome paragraph text.';
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({});
    expect(result.content).toBe(md);
  });

  it('should handle unquoted string values', () => {
    const md = `---
title: My Title
status: draft
---
Content`;
    const result = parseFrontmatter(md);
    expect(result.data.title).toBe('My Title');
    expect(result.data.status).toBe('draft');
  });

  it('should skip comments in frontmatter', () => {
    const md = `---
title: "Real Title"
# this is a comment
status: "published"
---
Body`;
    const result = parseFrontmatter(md);
    expect(result.data.title).toBe('Real Title');
    expect(result.data.status).toBe('published');
  });

  it('should handle empty frontmatter', () => {
    const md = `---
---
Content body`;
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({});
    expect(result.content).toBe('Content body');
  });

  it('should handle missing closing delimiter', () => {
    const md = 'Some content without frontmatter';
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({});
    expect(result.content).toBe(md);
  });

  it('should parse real-world frontmatter from a sample document', () => {
    const md = `---
title: "Project Architecture Overview"
tags: ["architecture", "system-design", "backend"]
date: "2024-12-15"
status: "published"
---
# Project Architecture Overview`;
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({
      title: 'Project Architecture Overview',
      tags: ['architecture', 'system-design', 'backend'],
      date: '2024-12-15',
      status: 'published',
    });
  });
});

FILE:instruccion
Cold-bundle de la tarea task-retirar-el-código-legacy-huérfano-de-marcado-ui-anotaciones-documentviewer-documentsidebar-types-ts: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- cd /mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run
- cd /mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui && npm run build
- cd /mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui && ! grep -rnE "AnnotationPopup|AnnotationsList|DocumentViewer|DocumentSidebar|useAnnotation|utils/frontmatter" src

