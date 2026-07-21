import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnnotations } from '../hooks/useAnnotations';
import type { Annotation } from '../types';

const STORAGE_PREFIX = 'annotations-';

describe('useAnnotations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with an empty list for a new docId', () => {
    const { result } = renderHook(() => useAnnotations('doc-1'));
    expect(result.current.annotations).toEqual([]);
  });

  it('should return empty array when docId is null', () => {
    const { result } = renderHook(() => useAnnotations(null));
    expect(result.current.annotations).toEqual([]);
  });

  it('should add an annotation and persist it', () => {
    const { result } = renderHook(() => useAnnotations('doc-1'));

    act(() => {
      result.current.addAnnotation('selected text', 0, 14, 'my note');
    });

    expect(result.current.annotations).toHaveLength(1);
    expect(result.current.annotations[0].selectedText).toBe('selected text');
    expect(result.current.annotations[0].note).toBe('my note');
    expect(result.current.annotations[0].startOffset).toBe(0);
    expect(result.current.annotations[0].endOffset).toBe(14);
    expect(result.current.annotations[0].docId).toBe('doc-1');
    expect(result.current.annotations[0].id).toMatch(/^ann-/);
    expect(result.current.annotations[0].createdAt).toBeTruthy();
  });

  it('should persist annotations to localStorage', () => {
    const { result } = renderHook(() => useAnnotations('doc-persist'));

    act(() => {
      result.current.addAnnotation('text', 0, 4, 'note');
    });

    const stored = JSON.parse(
      localStorage.getItem(`${STORAGE_PREFIX}doc-persist`) || '[]'
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].selectedText).toBe('text');
  });

  it('should load existing annotations from localStorage on mount', () => {
    const existing: Annotation[] = [
      {
        id: 'ann-pre-1',
        docId: 'doc-2',
        selectedText: 'pre-existing',
        startOffset: 0,
        endOffset: 12,
        note: 'loaded note',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem(`${STORAGE_PREFIX}doc-2`, JSON.stringify(existing));

    const { result } = renderHook(() => useAnnotations('doc-2'));
    expect(result.current.annotations).toHaveLength(1);
    expect(result.current.annotations[0].selectedText).toBe('pre-existing');
    expect(result.current.annotations[0].note).toBe('loaded note');
  });

  it('should delete an annotation', () => {
    const { result } = renderHook(() => useAnnotations('doc-del'));

    act(() => {
      result.current.addAnnotation('text-1', 0, 6, 'note 1');
    });
    act(() => {
      result.current.addAnnotation('text-2', 10, 16, 'note 2');
    });
    expect(result.current.annotations).toHaveLength(2);

    const idToDelete = result.current.annotations[0].id;
    act(() => {
      result.current.deleteAnnotation(idToDelete);
    });

    expect(result.current.annotations).toHaveLength(1);
    expect(result.current.annotations[0].selectedText).toBe('text-2');
  });

  it('should handle deletion of non-existent annotation gracefully', () => {
    const { result } = renderHook(() => useAnnotations('doc-foo'));

    act(() => {
      result.current.addAnnotation('text', 0, 4, 'note');
    });
    expect(result.current.annotations).toHaveLength(1);

    act(() => {
      result.current.deleteAnnotation('non-existent-id');
    });

    expect(result.current.annotations).toHaveLength(1);
  });

  it('should handle malformed localStorage data gracefully', () => {
    localStorage.setItem(`${STORAGE_PREFIX}doc-corrupt`, '{invalid json here');

    const { result } = renderHook(() => useAnnotations('doc-corrupt'));
    expect(result.current.annotations).toEqual([]);
  });

  it('should reload annotations when docId changes', () => {
    const { result, rerender } = renderHook(
      (docId: string | null) => useAnnotations(docId),
      { initialProps: 'doc-a' }
    );

    act(() => {
      result.current.addAnnotation('text-a', 0, 6, 'note a');
    });
    expect(result.current.annotations).toHaveLength(1);

    // Also add annotations for doc-b directly
    const docBAnnotations: Annotation[] = [
      {
        id: 'ann-b-1',
        docId: 'doc-b',
        selectedText: 'text-b',
        startOffset: 0,
        endOffset: 6,
        note: 'note b',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem(
      `${STORAGE_PREFIX}doc-b`,
      JSON.stringify(docBAnnotations)
    );

    rerender('doc-b');
    expect(result.current.annotations).toHaveLength(1);
    expect(result.current.annotations[0].selectedText).toBe('text-b');
  });

  it('should return null when adding annotation with null docId', () => {
    const { result } = renderHook(() => useAnnotations(null));

    let returned: Annotation | null = null;
    act(() => {
      returned = result.current.addAnnotation('text', 0, 4, 'note');
    });

    expect(returned).toBeNull();
    expect(result.current.annotations).toEqual([]);
  });

  it('should do nothing on delete when docId is null', () => {
    const { result } = renderHook(() => useAnnotations(null));

    act(() => {
      result.current.deleteAnnotation('some-id');
    });

    expect(result.current.annotations).toEqual([]);
  });
});
