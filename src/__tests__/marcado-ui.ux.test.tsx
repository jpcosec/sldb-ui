import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

beforeEach(() => {
  localStorage.clear();
});

describe('Marcado UI UX flow', () => {
  it('renders the canonical example and lets the user switch between rendered and source views', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /semantic markdown asg — canonical example/i })
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/this example introduces semantic milestone markers/i).length
    ).toBeGreaterThan(0);
    expect(document.querySelector('.marker-highlight-struct')).toBeTruthy();
    expect(document.querySelector('.marker-highlight-sem')).toBeTruthy();
    expect(document.querySelector('.marker-highlight-rhet')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /source/i }));

    expect(screen.getByLabelText(/marcado source editor/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/<!-- struct:intro -->/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /rendered/i }));

    expect(
      screen.getAllByText(/those ranges are later normalized into canonical json/i).length
    ).toBeGreaterThan(0);
  });

  it('allows filtering markers by namespace', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('#rhet:rationale.tree_overlap_limitation')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'rhet' })[0]);
    expect(screen.getByText('#rhet:rationale.tree_overlap_limitation')).toBeInTheDocument();
    expect(screen.queryByText('#struct:intro')).not.toBeInTheDocument();
    expect(screen.queryByText('#sem:concept.semantic_markdown')).not.toBeInTheDocument();
  });

  it('shows extracted marcado metadata, namespaces, edges, and marker anchors', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getAllByText('canonical-example').length).toBeGreaterThan(0);
    expect(screen.getAllByText('design_note').length).toBeGreaterThan(0);

    expect(screen.getAllByText('struct').length).toBeGreaterThan(0);
    expect(screen.getAllByText('sem').length).toBeGreaterThan(0);
    expect(screen.getAllByText('rhet').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /open sldb context/i }));
    expect(screen.getByText('Why this is separate')).toBeInTheDocument();
    expect(screen.getByText('#rhet:rationale.tree_overlap_limitation')).toBeInTheDocument();
    expect(screen.getByText('#rhet:decision.use_asg')).toBeInTheDocument();
  });

  it('supports adding a marker from rendered selection', async () => {
    const user = userEvent.setup();
    render(<App />);

    const selectedText = screen
      .getAllByText(/pure trees cannot represent crossing semantic ranges cleanly\./i)
      .find((element) => element.closest('.prose-content'));
    expect(selectedText).toBeTruthy();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(selectedText!);
    selection?.removeAllRanges();
    selection?.addRange(range);

    act(() => {
      selectedText!.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    await user.selectOptions(screen.getByLabelText(/marker namespace/i), 'sem');
    await user.type(screen.getByLabelText(/marker classification/i), 'concept.crossing_demo');
    await user.click(screen.getByRole('button', { name: /add marker/i }));
    await user.click(screen.getByRole('button', { name: /source/i }));

    expect(
      (screen.getByLabelText(/marcado source editor/i) as HTMLTextAreaElement).value
    ).toContain(
      '<!-- sem:concept.crossing_demo -->Pure trees cannot represent crossing semantic ranges cleanly.<!-- /sem:concept.crossing_demo -->'
    );
  });

  it('supports local save and load for source edits', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /source/i }));

    const editor = screen.getByLabelText(/marcado source editor/i);
    await user.clear(editor);
    await user.type(editor, '# Edited title\n\nEdited body');

    await user.click(screen.getByRole('button', { name: /save draft/i }));
    expect(screen.getByText(/saved draft for marcado-canonical-example/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^reset$/i }));
    expect(
      (screen.getByLabelText(/marcado source editor/i) as HTMLTextAreaElement).value
    ).toContain('Semantic Markdown ASG — Canonical Example');

    await user.click(screen.getByRole('button', { name: /load draft/i }));
    expect(screen.getByLabelText(/marcado source editor/i)).toHaveValue(
      '# Edited title\n\nEdited body'
    );
  });

  it('supports loading a file into the editor', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/upload file/i);
    const file = new File(['# Uploaded doc\n\nLoaded from disk'], 'uploaded.md', {
      type: 'text/markdown',
    });

    await user.upload(input, file);

    const editor = screen.getByLabelText(/marcado source editor/i);
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveValue('# Uploaded doc\n\nLoaded from disk');
    expect(screen.getByText(/opened uploaded\.md/i)).toBeInTheDocument();
  });

  it('supports creating and renaming a workspace file', async () => {
    const user = userEvent.setup();
    const promptSpy = vi.spyOn(window, 'prompt')
      .mockReturnValueOnce('drafts/new-note.md')
      .mockReturnValueOnce('drafts/renamed-note.md');

    render(<App />);
    await user.click(screen.getByRole('button', { name: /new file/i }));
    expect(screen.getAllByText(/drafts\/new-note\.md/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /rename/i }));
    expect(screen.getAllByText(/drafts\/renamed-note\.md/i).length).toBeGreaterThan(0);

    promptSpy.mockRestore();
  });

  it('supports native open file and folder exploration when available', async () => {
    const user = userEvent.setup();
    const markdownFileHandle = {
      kind: 'file',
      name: 'notes.md',
      getFile: vi.fn().mockResolvedValue(
        new File(['# Notes\n\nBody'], 'notes.md', { type: 'text/markdown' })
      ),
      createWritable: vi.fn(),
    };
    const folderFileHandle = {
      kind: 'file',
      name: 'folder-doc.md',
      getFile: vi.fn().mockResolvedValue(
        new File(['# Folder Doc\n\nFolder body'], 'folder-doc.md', { type: 'text/markdown' })
      ),
      createWritable: vi.fn(),
    };
    const directoryHandle = {
      kind: 'directory',
      name: 'docs',
      entries: async function* () {
        yield ['folder-doc.md', folderFileHandle];
      },
    };

    Object.assign(window, {
      showOpenFilePicker: vi.fn().mockResolvedValue([markdownFileHandle]),
      showDirectoryPicker: vi.fn().mockResolvedValue(directoryHandle),
    });

    render(<App />);

    await user.click(screen.getByRole('button', { name: /open file/i }));
    expect(screen.getByLabelText(/marcado source editor/i)).toHaveValue('# Notes\n\nBody');
    expect(screen.getByText(/opened notes\.md/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /explore folder/i }));
    expect(screen.getByText(/loaded 1 markdown file\(s\) from docs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/docs\/folder-doc\.md/i).length).toBeGreaterThan(0);
  });

  it('supports download action', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<App />);
    await user.click(screen.getByRole('button', { name: /download/i }));

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    clickSpy.mockRestore();
  });
});
