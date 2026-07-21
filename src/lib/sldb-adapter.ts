import type { MarcadoDocument } from "./marcado";

export type SldbValidationState = "ready" | "needs_attention";

export type SldbDocumentInterpretationMode = "runtime" | "fallback" | "local";
export type SldbDocumentOrigin = "bundled" | "draft" | "uploaded" | "opened" | "explored";

export interface SldbAdapterInput {
  document: MarcadoDocument;
  interpretationMode: SldbDocumentInterpretationMode;
  origin?: SldbDocumentOrigin;
  filePath?: string;
}

export interface SldbValidationSummary {
  state: SldbValidationState;
  contractLabel: string;
  provenance: "workspace-seam";
  blockingIssues: string[];
  advisoryNotes: string[];
}

export interface SldbAdapter {
  inspectValidation(input: SldbAdapterInput): SldbValidationSummary;
}

export const sldbAdapter: SldbAdapter = {
  inspectValidation({ document, interpretationMode, origin, filePath }) {
    const blockingIssues = [...document.diagnostics];
    const advisoryNotes: string[] = [];

    if (interpretationMode !== "runtime") {
      advisoryNotes.push(
        interpretationMode === "fallback"
          ? "Validation is currently based on degraded fallback parsing; refresh the Marcado runtime before relying on this seam as canonical."
          : "Validation is currently based on local workspace parsing; refresh the Marcado runtime before relying on this seam as canonical."
      );
    }

    if (!filePath) {
      advisoryNotes.push("This document is not yet connected to a tracked SLDB path.");
    }

    if (origin && origin !== "opened" && origin !== "explored") {
      advisoryNotes.push(`Current document origin: ${origin}.`);
    }

    return {
      state: blockingIssues.length > 0 ? "needs_attention" : "ready",
      contractLabel: document.type ? `${document.type} contract` : "document contract",
      provenance: "workspace-seam",
      blockingIssues,
      advisoryNotes,
    };
  },
};
