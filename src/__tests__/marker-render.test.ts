import { describe, expect, it } from "vitest";
import { type MarkerRange } from "../lib/marcado";
import { buildHighlightedMarkdown, getTextOffset } from "../lib/marker-render";

function marker(key: string, start: number, end: number): MarkerRange {
  const [namespace, classification] = key.split(":");
  return {
    key,
    namespace,
    classification,
    facets: [[classification]],
    start,
    end,
    text: "",
    localAnchor: `#${key}`,
    openMarkerStart: 0,
    openMarkerEnd: 0,
    closeMarkerStart: 0,
    closeMarkerEnd: 0,
  };
}

// Tests de caracterización: los valores esperados son la salida actual del código movido sin cambios.
describe("buildHighlightedMarkdown", () => {
  it("devuelve el markdown igual cuando no hay marcadores", () => {
    expect(buildHighlightedMarkdown("abc", [])).toBe("abc");
  });

  it("envuelve un marcador en un span con su namespace, la clave como title y data-marker-count=1", () => {
    expect(buildHighlightedMarkdown("Hola mundo fin", [marker("sem:a", 5, 10)])).toBe(
      'Hola <span class="marker-highlight marker-highlight-sem" title="sem:a" data-marker-count="1">mundo</span> fin'
    );
  });

  it("en el tramo común de dos marcadores solapados lista los namespaces en el orden del arreglo y cuenta 2", () => {
    const markers = [marker("sem:a", 4, 12), marker("rhet:b", 8, 19)];
    expect(buildHighlightedMarkdown("uno dos tres cuatro cinco", markers)).toBe(
      'uno <span class="marker-highlight marker-highlight-sem" title="sem:a" data-marker-count="1">dos </span>' +
        '<span class="marker-highlight marker-highlight-sem marker-highlight-rhet" title="sem:a | rhet:b" data-marker-count="2">tres</span>' +
        '<span class="marker-highlight marker-highlight-rhet" title="rhet:b" data-marker-count="1"> cuatro</span> cinco'
    );
  });

  it("escapa comillas y < > en el title", () => {
    expect(buildHighlightedMarkdown("texto", [marker('sem:"a"<b>', 0, 5)])).toBe(
      '<span class="marker-highlight marker-highlight-sem" title="sem:&quot;a&quot;&lt;b&gt;" data-marker-count="1">texto</span>'
    );
  });
});

describe("getTextOffset", () => {
  it("suma el texto previo al <strong> más el offset dentro de su nodo de texto", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>Hola <strong>mundo</strong> fin</p>";
    const strongText = container.querySelector("strong")!.firstChild!;
    expect(getTextOffset(container, strongText, 3)).toBe(8);
  });
});
