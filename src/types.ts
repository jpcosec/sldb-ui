export interface Frontmatter {
  title: string;
  tags: string[];
  date: string;
  status: "draft" | "review" | "published";
}

export interface Document {
  id: string;
  slug: string;
  content: string;
  frontmatter: Frontmatter;
}

export interface Annotation {
  id: string;
  docId: string;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  note: string;
  createdAt: string;
}