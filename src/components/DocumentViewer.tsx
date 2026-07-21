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