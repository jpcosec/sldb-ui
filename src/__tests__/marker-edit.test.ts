import { describe, expect, it } from "vitest";
import canonicalSource from "../data/marcado-canonical-example.md?raw";
import { parseMarcadoDocument } from "../lib/marcado";
import { removeMarkerFromSource, renameMarkerInSource } from "../lib/marker-edit";

// Tests de caracterización: los valores esperados son la salida actual del código movido sin cambios.
describe("marker-edit", () => {
  it("borrar quita la apertura y el cierre y deja el texto interior", () => {
    const source = "Hola <!-- sem:a -->mundo<!-- /sem:a --> fin";
    const doc = parseMarcadoDocument("doc", source);
    expect(removeMarkerFromSource(source, doc.bodySourceStart, doc.markers[0])).toBe("Hola mundo fin");
  });

  it("renombrar cambia la clave en la apertura y el cierre sin tocar otra aparición del mismo texto", () => {
    const source = "sem:a <!-- sem:a -->sem:a<!-- /sem:a --> sem:a";
    const doc = parseMarcadoDocument("doc", source);
    expect(renameMarkerInSource(source, doc.bodySourceStart, doc.markers[0], "sem:b")).toBe(
      "sem:a <!-- sem:b -->sem:a<!-- /sem:b --> sem:a"
    );
  });

  it("deja intacto el frontmatter del ejemplo canónico al borrar y al renombrar", () => {
    const doc = parseMarcadoDocument("marcado-canonical-example", canonicalSource);
    expect(doc.bodySourceStart).toBe(537);
    const target = doc.markers[0];
    expect(target.key).toBe("struct:intro");
    const frontmatter = canonicalSource.slice(0, doc.bodySourceStart);

    const deleted = removeMarkerFromSource(canonicalSource, doc.bodySourceStart, target);
    const renamed = renameMarkerInSource(canonicalSource, doc.bodySourceStart, target, "struct:intro_renamed");

    expect(deleted.slice(0, doc.bodySourceStart)).toBe(frontmatter);
    expect(renamed.slice(0, doc.bodySourceStart)).toBe(frontmatter);
    expect(parseMarcadoDocument("deleted", deleted).frontmatterRaw).toBe(doc.frontmatterRaw);
    expect(parseMarcadoDocument("deleted", deleted).markers.map((m) => m.key)).toEqual([
      "sem:concept.semantic_markdown",
      "sem:function.definition",
      "rhet:rationale.tree_overlap_limitation",
      "rhet:decision.use_asg",
    ]);
    expect(parseMarcadoDocument("renamed", renamed).frontmatterRaw).toBe(doc.frontmatterRaw);
    expect(parseMarcadoDocument("renamed", renamed).markers[0].key).toBe("struct:intro_renamed");
  });
});
