import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DocumentViewer from '../components/DocumentViewer';
import type { Document, Annotation } from '../types';

const sampleDoc: Document = {
  id: 'doc-1',
  slug: 'project-architecture',
  content: '# Project Architecture Overview\n\nSome content here.',
  frontmatter: {
    title: 'Project Architecture Overview',
    tags: ['architecture', 'system-design'],
    date: '2024-12-15',
    status: 'published',
  },
};

const sampleAnnotations: Annotation[] = [
  {
    id: 'ann-1',
    docId: 'doc-1',
    selectedText: 'Project Architecture Overview',
    startOffset: 2,
    endOffset: 29,
    note: 'Important section',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

describe('DocumentViewer', () => {
  const contentRef = { current: null as HTMLDivElement | null };

  // NODE-08: Empty state when no document selected
  it('should render empty state when no document is selected', () => {
    render(
      <DocumentViewer
        document={null}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    expect(screen.getByText('Select a document to view')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Browse your documents from the sidebar and start annotating'
      )
    ).toBeInTheDocument();
  });

  // NODE-09: Document content renders
  it('should render document content when a document is selected', () => {
    render(
      <DocumentViewer
        document={sampleDoc}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    // react-markdown renders content
    expect(
      screen.getAllByText('Project Architecture Overview').length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Some content here.')).toBeInTheDocument();
  });

  // NODE-11: Metadata panel renders
  it('should render metadata panel with document details', () => {
    render(
      <DocumentViewer
        document={sampleDoc}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    expect(screen.getByText('Metadata')).toBeInTheDocument();
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('2024-12-15')).toBeInTheDocument();
    expect(screen.getByText('#architecture')).toBeInTheDocument();
    expect(screen.getByText('#system-design')).toBeInTheDocument();
  });

  // NODE-11: Annotation count displays
  it('should show annotation count in metadata', () => {
    render(
      <DocumentViewer
        document={sampleDoc}
        annotations={sampleAnnotations}
        contentRef={contentRef}
      />
    );
    expect(screen.getByRole('heading', { name: /annotations/i })).toHaveTextContent('1');
  });

  it('should show plural annotation count', () => {
    const manyAnnotations = [
      ...sampleAnnotations,
      {
        id: 'ann-2',
        docId: 'doc-1',
        selectedText: 'content',
        startOffset: 30,
        endOffset: 37,
        note: 'Another note',
        createdAt: '2025-01-02T00:00:00.000Z',
      },
    ];
    render(
      <DocumentViewer
        document={sampleDoc}
        annotations={manyAnnotations}
        contentRef={contentRef}
      />
    );
    expect(screen.getByRole('heading', { name: /annotations/i })).toHaveTextContent('2');
  });

  // NODE-11: No tags edge case
  it('should show "No tags" when document has no tags', () => {
    const docNoTags: Document = {
      ...sampleDoc,
      frontmatter: { ...sampleDoc.frontmatter, tags: [] },
    };
    render(
      <DocumentViewer
        document={docNoTags}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    expect(screen.getByText('No tags')).toBeInTheDocument();
  });

  // Status badge variant colors
  it('should render status badge with correct styling for published', () => {
    render(
      <DocumentViewer
        document={sampleDoc}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    const badge = screen.getByText('published');
    expect(badge.className).toContain('text-success');
  });

  it('should render status badge with correct styling for draft', () => {
    const draftDoc: Document = {
      ...sampleDoc,
      frontmatter: { ...sampleDoc.frontmatter, status: 'draft' },
    };
    render(
      <DocumentViewer
        document={draftDoc}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    const badge = screen.getByText('draft');
    expect(badge.className).toContain('text-muted');
  });

  it('should render status badge with correct styling for review', () => {
    const reviewDoc: Document = {
      ...sampleDoc,
      frontmatter: { ...sampleDoc.frontmatter, status: 'review' },
    };
    render(
      <DocumentViewer
        document={reviewDoc}
        annotations={[]}
        contentRef={contentRef}
      />
    );
    const badge = screen.getByText('review');
    expect(badge.className).toContain('text-warning');
  });
});
