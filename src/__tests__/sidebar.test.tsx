import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentSidebar from '../components/DocumentSidebar';
import type { Document } from '../types';

// Sample documents for testing
const sampleDocs: Document[] = [
  {
    id: 'doc-1',
    slug: 'project-architecture',
    content: '# Architecture',
    frontmatter: {
      title: 'Project Architecture Overview',
      tags: ['architecture', 'system-design'],
      date: '2024-12-15',
      status: 'published',
    },
  },
  {
    id: 'doc-2',
    slug: 'research-state-management',
    content: '# State Management',
    frontmatter: {
      title: 'Research: State Management',
      tags: ['react', 'state-management', 'frontend'],
      date: '2024-12-10',
      status: 'review',
    },
  },
  {
    id: 'doc-3',
    slug: 'draft-note',
    content: '# Draft',
    frontmatter: {
      title: 'Unfinished Draft Note',
      tags: ['draft', 'ideas'],
      date: '2024-11-01',
      status: 'draft',
    },
  },
];

describe('DocumentSidebar', () => {
  const defaultProps = {
    documents: sampleDocs,
    selectedDocId: null,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // NODE-01: Sidebar renders
  it('should render the sidebar with heading and search input', () => {
    render(<DocumentSidebar {...defaultProps} />);
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search by title or tag...')
    ).toBeInTheDocument();
  });

  // NODE-03: Document cards render
  it('should render all document cards', () => {
    render(<DocumentSidebar {...defaultProps} />);
    expect(
      screen.getByText('Project Architecture Overview')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Research: State Management')
    ).toBeInTheDocument();
    expect(screen.getByText('Unfinished Draft Note')).toBeInTheDocument();
  });

  // NODE-04: Status badges render with correct text
  it('should render status badges for each document', () => {
    render(<DocumentSidebar {...defaultProps} />);
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('review')).toBeInTheDocument();
    expect(screen.getAllByText('draft').length).toBeGreaterThan(0);
  });

  // Tag chips render
  it('should render tag chips for each document', () => {
    render(<DocumentSidebar {...defaultProps} />);
    expect(screen.getByText('architecture')).toBeInTheDocument();
    expect(screen.getByText('system-design')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('state-management')).toBeInTheDocument();
    expect(screen.getAllByText('draft').length).toBeGreaterThan(0);
    expect(screen.getByText('ideas')).toBeInTheDocument();
  });

  // EDGE: Tags overflow (>3 tags)
  it('should show +N for documents with more than 3 tags', () => {
    const docWithManyTags: Document = {
      id: 'many-tags',
      slug: 'many-tags',
      content: '# Many tags',
      frontmatter: {
        title: 'Many Tags Doc',
        tags: ['a', 'b', 'c', 'd', 'e'],
        date: '2024-01-01',
        status: 'draft',
      },
    };
    render(
      <DocumentSidebar
        documents={[docWithManyTags]}
        selectedDocId={null}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  // NODE-02.search-focused: Search filters by title
  it('should filter documents by title', async () => {
    const user = userEvent.setup();
    render(<DocumentSidebar {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by title or tag...');

    await user.type(search, 'architecture');

    expect(
      screen.getByText('Project Architecture Overview')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Research: State Management')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Unfinished Draft Note')).not.toBeInTheDocument();
  });

  // NODE-02: Search filters by tag
  it('should filter documents by tag', async () => {
    const user = userEvent.setup();
    render(<DocumentSidebar {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by title or tag...');

    await user.type(search, 'frontend');

    expect(
      screen.getByText('Research: State Management')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Project Architecture Overview')
    ).not.toBeInTheDocument();
  });

  // NODE-05: Empty state when no match
  it('should show empty state when search matches nothing', async () => {
    const user = userEvent.setup();
    render(<DocumentSidebar {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by title or tag...');

    await user.type(search, 'xyznonexistent');

    expect(screen.getByText('No matching documents')).toBeInTheDocument();
  });

  // NODE-05: Empty state when no documents
  it('should show empty state when documents array is empty', () => {
    render(
      <DocumentSidebar
        documents={[]}
        selectedDocId={null}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText('No documents available')).toBeInTheDocument();
  });

  // NODE-03: Clear search restores all documents
  it('should restore all documents when search is cleared', async () => {
    const user = userEvent.setup();
    render(<DocumentSidebar {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by title or tag...');

    await user.type(search, 'architecture');
    expect(
      screen.queryByText('Research: State Management')
    ).not.toBeInTheDocument();

    await user.clear(search);
    expect(
      screen.getByText('Research: State Management')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Project Architecture Overview')
    ).toBeInTheDocument();
  });

  // NODE-03: Click calls onSelect
  it('should call onSelect when a document card is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <DocumentSidebar
        documents={sampleDocs}
        selectedDocId={null}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByText('Project Architecture Overview'));
    expect(onSelect).toHaveBeenCalledWith(sampleDocs[0]);
  });

  // NODE-03: Selected state shows different style
  it('should apply selected styles to the active document', () => {
    render(
      <DocumentSidebar
        documents={sampleDocs}
        selectedDocId="doc-1"
        onSelect={vi.fn()}
      />
    );
    const selectedButton = screen.getByText(
      'Project Architecture Overview'
    ).closest('button');
    expect(selectedButton?.className).toContain('bg-primary/10');
  });

  // Search with special regex chars (boundary)
  it('should handle search with special regex characters', async () => {
    const user = userEvent.setup();
    render(<DocumentSidebar {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search by title or tag...');

    fireEvent.change(search, { target: { value: '[.*+?^${}()|\\]' } });

    expect(screen.getByText('No matching documents')).toBeInTheDocument();
  });

  // Date is rendered
  it('should render the date for each document', () => {
    render(<DocumentSidebar {...defaultProps} />);
    expect(screen.getByText('2024-12-15')).toBeInTheDocument();
    expect(screen.getByText('2024-12-10')).toBeInTheDocument();
    expect(screen.getByText('2024-11-01')).toBeInTheDocument();
  });

  // cursor-pointer on document cards
  it('document cards should have cursor-pointer class', () => {
    render(<DocumentSidebar {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn.className).toContain('cursor-pointer');
    });
  });
});
