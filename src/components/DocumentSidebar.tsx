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