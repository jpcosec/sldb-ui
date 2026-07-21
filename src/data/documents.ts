import marcadoExampleRaw from "./marcado-canonical-example.md?raw";
import marcadoExampleRuntime from "./runtime/marcado-canonical-example.runtime.json";
import { type MarcadoDocument } from "../lib/marcado";
import { runtimeExportToDocument, type RuntimeExportDocument } from "../lib/marcado-runtime";

const rawDocs: Array<{ slug: string; raw: string; runtime: RuntimeExportDocument }> = [
  {
    slug: "marcado-canonical-example",
    raw: marcadoExampleRaw,
    runtime: marcadoExampleRuntime as RuntimeExportDocument,
  },
];

export function loadDocuments(): MarcadoDocument[] {
  return rawDocs.map(({ slug, raw, runtime }) => runtimeExportToDocument(slug, raw, runtime));
}

export function getDocumentBySlug(slug: string): MarcadoDocument | undefined {
  return loadDocuments().find((doc) => doc.slug === slug);
}
