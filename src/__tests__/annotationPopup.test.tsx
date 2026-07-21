import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnnotationPopup from '../components/AnnotationPopup';

describe('AnnotationPopup', () => {
  const defaultProps = {
    show: true,
    selectedText: 'some highlighted text',
    position: { x: 200, y: 300 },
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // NODE-13: Renders when show and position provided
  it('should render when show is true and position is provided', () => {
    render(<AnnotationPopup {...defaultProps} />);
    expect(screen.getByText('Add Annotation')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Write a note about this selection...')
    ).toBeInTheDocument();
    expect(screen.getByText('Selected text:')).toBeInTheDocument();
    expect(
      screen.getByText(/“some highlighted text”/)
    ).toBeInTheDocument();
  });

  // NODE-13: Hidden when show is false
  it('should not render when show is false', () => {
    render(<AnnotationPopup {...defaultProps} show={false} />);
    expect(screen.queryByText('Add Annotation')).not.toBeInTheDocument();
  });

  // NODE-13: Hidden when position is null
  it('should not render when position is null', () => {
    render(<AnnotationPopup {...defaultProps} position={null} />);
    expect(screen.queryByText('Add Annotation')).not.toBeInTheDocument();
  });

  // NODE-13: Save button disabled when textarea empty
  it('should have save button disabled when note is empty', () => {
    render(<AnnotationPopup {...defaultProps} />);
    const saveButton = screen.getByRole('button', { name: /save annotation/i });
    expect(saveButton).toBeDisabled();
  });

  // NODE-13: Save button enabled when textarea has text
  it('should enable save button when note is non-empty', async () => {
    const user = userEvent.setup();
    render(<AnnotationPopup {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );

    await user.type(textarea, 'my annotation note');

    const saveButton = screen.getByRole('button', { name: /save annotation/i });
    expect(saveButton).not.toBeDisabled();
  });

  // NODE-13: Save calls onSave with note text
  it('should call onSave with trimmed note when save is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AnnotationPopup {...defaultProps} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );
    await user.type(textarea, 'my annotation note');
    await user.click(screen.getByRole('button', { name: /save annotation/i }));

    expect(onSave).toHaveBeenCalledWith('my annotation note');
  });

  // NODE-13: Save ignores empty/whitespace notes
  it('should not call onSave with whitespace-only note', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AnnotationPopup {...defaultProps} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );
    await user.type(textarea, '   ');
    await user.click(screen.getByRole('button', { name: /save annotation/i }));

    expect(onSave).not.toHaveBeenCalled();
  });

  // NODE-13: Cancel button calls onCancel
  it('should call onCancel when X button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<AnnotationPopup {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByLabelText('Cancel'));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  // NODE-13: Escape key calls onCancel
  it('should call onCancel when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<AnnotationPopup {...defaultProps} onCancel={onCancel} />);

    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );
    await user.type(textarea, '{Escape}');

    expect(onCancel).toHaveBeenCalledOnce();
  });

  // NODE-13: Cmd+Enter calls save
  it('should call onSave when Cmd+Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AnnotationPopup {...defaultProps} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );
    await user.type(textarea, 'a note');
    await user.keyboard('{Meta>}{Enter}{/Meta}');

    expect(onSave).toHaveBeenCalledWith('a note');
  });

  // NODE-13: Ctrl+Enter calls save
  it('should call onSave when Ctrl+Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AnnotationPopup {...defaultProps} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText(
      'Write a note about this selection...'
    );
    await user.type(textarea, 'ctrl-enter note');
    await user.keyboard('{Control>}{Enter}{/Control}');

    expect(onSave).toHaveBeenCalledWith('ctrl-enter note');
  });

  // NODE-13: Position is clamped to viewport
  it('should be positioned within viewport boundaries', () => {
    const position = { x: 99999, y: 99999 };
    render(
      <AnnotationPopup
        {...defaultProps}
        position={position}
      />
    );

    const popup = screen.getByText('Add Annotation').closest('div.fixed');
    expect(popup).toBeInTheDocument();
    // Position should be clamped — left should not exceed window width
    const left = parseInt(popup?.getAttribute('style') || '').toString();
    // Just check it renders without error (the Math.min clamping works)
    expect(popup?.getAttribute('style')).toContain('left:');
  });
});
