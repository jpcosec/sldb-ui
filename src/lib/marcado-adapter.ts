import { parseMarcadoDocument, type MarcadoDocument } from "./marcado";
import { parseSourceWithRuntimeFallback } from "./marcado-runtime";

export type MarcadoAdapterInput = {
  slug: string;
  source: string;
  filePath?: string;
};

export type MarcadoInterpretedDocument = MarcadoAdapterInput & {
  model: MarcadoDocument;
};

export interface MarcadoAdapter {
  parse(input: MarcadoAdapterInput): MarcadoDocument;
  refresh(input: MarcadoAdapterInput): Promise<MarcadoDocument>;
  interpret(input: MarcadoAdapterInput): Promise<MarcadoInterpretedDocument>;
  handoff(input: MarcadoAdapterInput & { model?: MarcadoDocument }): MarcadoInterpretedDocument;
}

export const marcadoAdapter: MarcadoAdapter = {
  parse({ slug, source }) {
    return parseMarcadoDocument(slug, source);
  },
  async refresh({ slug, source, filePath }) {
    return parseSourceWithRuntimeFallback(slug, source, filePath);
  },
  async interpret(input) {
    return {
      ...input,
      model: await this.refresh(input),
    };
  },
  handoff({ slug, source, filePath, model }) {
    return {
      slug,
      source,
      filePath,
      model: model ?? this.parse({ slug, source, filePath }),
    };
  },
};
