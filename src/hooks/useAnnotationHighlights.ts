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