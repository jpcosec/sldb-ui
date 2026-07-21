import { describe, expect, it } from "vitest";
import { parseMarcadoDocument } from "../lib/marcado";
import { sldbAdapter } from "../lib/sldb-adapter";

describe("sldbAdapter", () => {
  it("reports a ready validation seam when no local structural blockers are present", () => {
    const source = "---\ndocument:\n  id: ready-example\n  title: Ready Example\n  type: note\n---\n\n# Ready Example\n";
    const document = parseMarcadoDocument("file:ready.md", source);

    const summary = sldbAdapter.inspectValidation({
      document,
      interpretationMode: "runtime",
      filePath: "notes/ready.md",
      origin: "opened",
    });

    expect(summary.state).toBe("ready");
    expect(summary.contractLabel).toBe("note contract");
    expect(summary.blockingIssues).toEqual([]);
    expect(summary.advisoryNotes).toEqual([]);
  });

  it("surfaces diagnostics and degraded provenance through the SLDB seam", () => {
    const source = "---\ndocument:\n  id: attention-example\n  title: Attention Example\n  type: design_note\n---\n\n<!-- sem:concept.unclosed -->Attention\n";
    const document = parseMarcadoDocument("file:attention.md", source);

    const summary = sldbAdapter.inspectValidation({
      document,
      interpretationMode: "fallback",
      origin: "bundled",
    });

    expect(summary.state).toBe("needs_attention");
    expect(summary.blockingIssues).toContain("Open marker without close: sem:concept.unclosed");
    expect(summary.advisoryNotes).toContain(
      "Validation is currently based on degraded fallback parsing; refresh the Marcado runtime before relying on this seam as canonical."
    );
    expect(summary.advisoryNotes).toContain("This document is not yet connected to a tracked SLDB path.");
    expect(summary.advisoryNotes).toContain("Current document origin: bundled.");
  });
});
