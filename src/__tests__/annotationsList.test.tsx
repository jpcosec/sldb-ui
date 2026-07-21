import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnnotationsList from '../components/AnnotationsList';
import type { Annotation } from '../types';

const sampleAnnotations: Annotation[] = [
  {
    id: 'ann-1',
    docId: 'doc-1',
    selectedText: 'first selection',
    startOffset: 0,
    endOffset: 15,
    note: 'my first annotation note',
    createdAt: '2025-01-15T10:30:00.000Z',
  },
  {
    id: 'ann-2',
    docId: 'doc-1',
    selectedText: 'second selection',
    startOffset: 20,
    endOffset: 36,
    note: 'another annotation',
    createdAt: '2025-02-20T14:45:00.000Z',
  },
];

describe('AnnotationsList', () => {
  const defaultProps = {
    annotations: sampleAnnotations,
    onDelete: vi.fn(),
    onScrollTo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // NODE-16: Empty state
  it('should show empty state when there are no annotations', () => {
    render(
      <AnnotationsList
        annotations={[]}
        onDelete={vi.fn()}
        onScrollTo={vi.fn()}
      />
    );
    expect(
      screen.getByText(
        'Select text in the document to add your first annotation'
      )
    ).toBeInTheDocument();
  });

  // NODE-15: Renders annotation cards
  it('should render all annotation cards', () => {
    render(<AnnotationsList {...defaultProps} />);
    expect(screen.getByText(/“first selection”/)).toBeInTheDocument();
    expect(screen.getByText(/“second selection”/)).toBeInTheDocument();
    expect(screen.getByText('my first annotation note')).toBeInTheDocument();
    expect(screen.getByText('another annotation')).toBeInTheDocument();
  });

  // NODE-15: Date formatted correctly
  it('should render formatted date for each annotation', () => {
    render(<AnnotationsList {...defaultProps} />);
    // Jan 15, 2025
    expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
  });

  // NODE-15: onScrollTo called when card is clicked
  it('should call onScrollTo when annotation card is clicked', async () => {
    const user = userEvent.setup();
    const onScrollTo = vi.fn();
    render(
      <AnnotationsList
        annotations={sampleAnnotations}
        onDelete={vi.fn()}
        onScrollTo={onScrollTo}
      />
    );

    await user.click(screen.getByText(/“first selection”/));
    expect(onScrollTo).toHaveBeenCalledWith(sampleAnnotations[0]);
  });

  // NODE-15: Delete button calls onDelete with correct id
  it('should call onDelete with annotation id when delete is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <AnnotationsList
        annotations={sampleAnnotations}
        onDelete={onDelete}
        onScrollTo={vi.fn()}
      />
    );

    // Delete buttons are only visible on hover (opacity: 0 → 1)
    // But they still exist in the DOM and can be clicked
    const deleteButtons = screen.getAllByLabelText('Delete annotation');
    expect(deleteButtons).toHaveLength(2);

    await user.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith('ann-1');
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  // NODE-15: Clicking delete does not trigger onScrollTo (stopPropagation)
  it('should not trigger onScrollTo when delete is clicked', async () => {
    const user = userEvent.setup();
    const onScrollTo = vi.fn();
    const onDelete = vi.fn();
    render(
      <AnnotationsList
        annotations={sampleAnnotations.slice(0, 1)}
        onDelete={onDelete}
        onScrollTo={onScrollTo}
      />
    );

    await user.click(screen.getByLabelText('Delete annotation'));
    expect(onDelete).toHaveBeenCalled();
    expect(onScrollTo).not.toHaveBeenCalled();
  });

  // Annotation count in the list (tested via the parent, but check each item is rendered)
  it('should render all annotation items sequentially', () => {
    render(<AnnotationsList {...defaultProps} />);
    const items = screen.getAllByRole('button');
    // Each card is a button + each delete button is nested
    // The cards themselves are buttons
    expect(items.length).toBeGreaterThanOrEqual(2);
  });
});
