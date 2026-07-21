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