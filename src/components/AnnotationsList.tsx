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