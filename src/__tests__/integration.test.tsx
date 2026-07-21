import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Integration — @sldb/ui workspace flows with Marcado support', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads the canonical example on startup and renders its metadata', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /semantic markdown asg — canonical example/i })).toBeInTheDocument();
    expect(screen.getAllByText('canonical-example').length).toBeGreaterThan(0);
    expect(screen.getByText('design_note')).toBeInTheDocument();
    expect(screen.getByText('struct:intro')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /sldb validation/i })).toBeInTheDocument();
    expect(screen.getByText(/design_note contract/i)).toBeInTheDocument();
    expect(screen.getByText(/^ready$/i)).toBeInTheDocument();
  });

  it('switches between rendered and source views', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /source/i }));
    expect((screen.getByLabelText(/marcado source editor/i) as HTMLTextAreaElement).value).toContain('Semantic Markdown ASG');

    await user.click(screen.getByRole('button', { name: /rendered/i }));
    expect(screen.queryByLabelText(/marcado source editor/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/pure trees cannot represent crossing semantic ranges cleanly/i).length).toBeGreaterThan(0);
  });

  it('exposes an explicit SLDB validation affordance from the toolbar', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /check sldb validation/i }));

    expect(screen.getByText(/sldb validation seam found no local structural blockers for canonical-example/i)).toBeInTheDocument();
  });

  it('creates a new workspace file and preserves edits after rename', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'prompt')
      .mockReturnValueOnce('drafts/new-note.md')
      .mockReturnValueOnce('drafts/renamed-note.md');

    render(<App />);

    await user.click(screen.getByRole('button', { name: /new file/i }));
    const editor = screen.getByLabelText(/marcado source editor/i);
    await user.clear(editor);
    await user.type(editor, '# Renamed content');

    await user.click(screen.getByRole('button', { name: /rename/i }));

    expect(screen.getAllByText(/drafts\/renamed-note\.md/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/marcado source editor/i)).toHaveValue('# Renamed content');
  });

  it('filters rendered highlights and marker cards by namespace', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('struct:intro')).toBeInTheDocument();
    expect(screen.getByText('rhet:rationale.tree_overlap_limitation')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'rhet' })[0]);

    expect(screen.getByText('rhet:rationale.tree_overlap_limitation')).toBeInTheDocument();
    expect(screen.queryByText('struct:intro')).not.toBeInTheDocument();
    expect(screen.queryByText('sem:concept.semantic_markdown')).not.toBeInTheDocument();
  });

  it('saves and restores draft changes through localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /source/i }));
    const editor = screen.getByLabelText(/marcado source editor/i);
    await user.type(editor, '\n<!-- sem:concept.extra -->extra<!-- /sem:concept.extra -->');

    await user.click(screen.getByRole('button', { name: /save draft/i }));
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText(/marcado source editor/i)).not.toHaveValue(
      expect.stringContaining('sem:concept.extra')
    );

    await user.click(screen.getByRole('button', { name: /load draft/i }));
    expect((screen.getByLabelText(/marcado source editor/i) as HTMLTextAreaElement).value).toContain('sem:concept.extra');
  });

  it('refreshes the selected document from the Marcado runtime when available', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        document: {
          id: 'canonical-example',
          title: 'Runtime Refreshed Title',
          type: 'design_note',
        },
        source: {
          plain_text: '\n# Semantic Markdown ASG\n',
          frontmatter: {
            namespaces: {
              struct: { projection: 'tree', allow_crossing: false },
              sem: { projection: 'taxonomy', allow_crossing: true },
              rhet: { projection: 'graph', allow_crossing: true, requires_addressable_nodes: true },
            },
            graphs: {
              rhet: {
                edges: [
                  {
                    type: 'justifies',
                    from: 'rhet:rationale.tree_overlap_limitation',
                    to: 'rhet:decision.use_asg',
                  },
                ],
              },
            },
          },
        },
        markers: [],
        ranges: [],
        diagnostics: [],
        validation: { valid: true, blocking: [], lint: [] },
      }),
    } as Response);

    render(<App />);
    await user.click(screen.getByRole('button', { name: /refresh runtime/i }));

    expect(fetchSpy).toHaveBeenCalledWith('/api/marcado/export', expect.objectContaining({ method: 'POST' }));
    expect(screen.getByRole('heading', { name: /runtime refreshed title/i })).toBeInTheDocument();
    expect(screen.getByText(/refreshed canonical-example from marcado runtime/i)).toBeInTheDocument();
    expect(screen.getAllByText(/marcado runtime/i).length).toBeGreaterThan(0);
  });

  it('makes degraded fallback refresh explicit when runtime export is unavailable', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('runtime offline'));

    render(<App />);
    await user.click(screen.getByRole('button', { name: /refresh runtime/i }));

    expect(screen.getByText(/marcado runtime unavailable; refreshed canonical-example with degraded fallback parsing/i)).toBeInTheDocument();
    expect(screen.getByText(/fallback parsing \(degraded\)/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /semantic markdown asg — canonical example/i })).toBeInTheDocument();
  });

  it('handles localStorage read failures gracefully', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    render(<App />);

    expect(screen.getByRole('heading', { name: /semantic markdown asg — canonical example/i })).toBeInTheDocument();
    getItemSpy.mockRestore();
  });

  it('opens an uploaded markdown file into the workspace', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(['# Uploaded\n\nBody'], 'uploaded.md', { type: 'text/markdown' });
    const input = screen.getByLabelText(/upload file/i);
    await user.upload(input, file);

    expect(screen.getByLabelText(/marcado source editor/i)).toHaveValue('# Uploaded\n\nBody');
    expect(screen.getAllByText(/uploaded\.md/i).length).toBeGreaterThan(0);
  });

  it('supports native open-file save-as fallback when no handle exists yet', async () => {
    const user = userEvent.setup();
    const writable = { write: vi.fn(), close: vi.fn() };
    const saveHandle = {
      kind: 'file',
      name: 'saved.md',
      createWritable: vi.fn().mockResolvedValue(writable),
      getFile: vi.fn(),
    };

    Object.assign(window, {
      showOpenFilePicker: vi.fn(),
      showDirectoryPicker: vi.fn(),
      showSaveFilePicker: vi.fn().mockResolvedValue(saveHandle),
    });

    render(<App />);
    await user.click(screen.getByRole('button', { name: /save file/i }));

    expect(window.showSaveFilePicker).toHaveBeenCalled();
    expect(saveHandle.createWritable).toHaveBeenCalled();
    expect(writable.write).toHaveBeenCalled();
    expect(screen.getByText(/saved file saved\.md/i)).toBeInTheDocument();
  });
});
