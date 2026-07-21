import { parseMarcadoDocument, type MarcadoDocument } from "./marcado";
import { refreshMarcadoDocument, type MarcadoRuntimeMode } from "./marcado-runtime";

export type MarcadoAdapterInput = {
  slug: string;
  source: string;
  filePath?: string;
};

export type MarcadoInterpretedDocument = MarcadoAdapterInput & {
  model: MarcadoDocument;
  mode: MarcadoRuntimeMode | "local";
};

export interface MarcadoAdapter {
  parse(input: MarcadoAdapterInput): MarcadoDocument;
  refresh(input: MarcadoAdapterInput): Promise<MarcadoInterpretedDocument>;
  interpret(input: MarcadoAdapterInput): Promise<MarcadoInterpretedDocument>;
  handoff(input: MarcadoAdapterInput & { model?: MarcadoDocument }): MarcadoInterpretedDocument;
}

export const marcadoAdapter: MarcadoAdapter = {
  parse({ slug, source }) {
    return parseMarcadoDocument(slug, source);
  },
  async refresh({ slug, source, filePath }) {
    const refreshed = await refreshMarcadoDocument(slug, source, filePath);
    return {
      slug,
      source,
      filePath,
      mode: refreshed.mode,
      model: refreshed.model,
    };
  },
  async interpret(input) {
    return this.refresh(input);
  },
  handoff({ slug, source, filePath, model }) {
    return {
      slug,
      source,
      filePath,
      mode: "local",
      model: model ?? this.parse({ slug, source, filePath }),
    };
  },
};
