import { afterEach, describe, expect, it, vi } from "vitest";
import { marcadoAdapter } from "../lib/marcado-adapter";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("marcadoAdapter", () => {
  it("parses and hands off local source through a named adapter contract", () => {
    const source = "---\ndocument:\n  id: example\n  title: Adapter Example\n  type: note\n---\n\n# Adapter Example\n";

    const parsed = marcadoAdapter.parse({ slug: "file:example.md", source });
    const handedOff = marcadoAdapter.handoff({ slug: "file:example.md", source });

    expect(parsed.title).toBe("Adapter Example");
    expect(handedOff.source).toBe(source);
    expect(handedOff.model.title).toBe("Adapter Example");
  });

  it("refreshes through the runtime path and returns an interpreted document handoff", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        document: {
          id: "runtime-example",
          title: "Runtime Adapter Title",
          type: "design_note",
        },
        source: {
          plain_text: "\n# Runtime Adapter Title\n",
          frontmatter: {
            namespaces: {
              sem: { projection: "taxonomy", allow_crossing: true },
            },
          },
        },
        markers: [],
        ranges: [],
        diagnostics: [],
        validation: { blocking: [], lint: [] },
      }),
    } as Response);

    const interpreted = await marcadoAdapter.interpret({
      slug: "file:runtime.md",
      source: "---\ndocument:\n  id: local\n  title: Local Title\n---\n\n# Local Title\n",
      filePath: "runtime.md",
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/marcado/export",
      expect.objectContaining({ method: "POST" })
    );
    expect(interpreted.source).toContain("Local Title");
    expect(interpreted.model.title).toBe("Runtime Adapter Title");
    expect(interpreted.model.id).toBe("runtime-example");
  });
});
