import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseFrontmatter } from '../utils/frontmatter';

describe('parseFrontmatter', () => {
  it('should parse valid frontmatter with string values', () => {
    const md = `---
title: "My Title"
status: "draft"
date: "2024-01-01"
---
# Content body`;
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({
      title: 'My Title',
      status: 'draft',
      date: '2024-01-01',
    });
    expect(result.content).toBe('# Content body');
  });

  it('should parse frontmatter with array values', () => {
    const md = `---
title: "Test"
tags: ["react", "typescript", "testing"]
---
# Hello`;
    const result = parseFrontmatter(md);
    expect(result.data.tags).toEqual(['react', 'typescript', 'testing']);
  });

  it('should return empty data and full content when no frontmatter', () => {
    const md = '# Just a heading\n\nSome paragraph text.';
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({});
    expect(result.content).toBe(md);
  });

  it('should handle unquoted string values', () => {
    const md = `---
title: My Title
status: draft
---
Content`;
    const result = parseFrontmatter(md);
    expect(result.data.title).toBe('My Title');
    expect(result.data.status).toBe('draft');
  });

  it('should skip comments in frontmatter', () => {
    const md = `---
title: "Real Title"
# this is a comment
status: "published"
---
Body`;
    const result = parseFrontmatter(md);
    expect(result.data.title).toBe('Real Title');
    expect(result.data.status).toBe('published');
  });

  it('should handle empty frontmatter', () => {
    const md = `---
---
Content body`;
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({});
    expect(result.content).toBe('Content body');
  });

  it('should handle missing closing delimiter', () => {
    const md = 'Some content without frontmatter';
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({});
    expect(result.content).toBe(md);
  });

  it('should parse real-world frontmatter from a sample document', () => {
    const md = `---
title: "Project Architecture Overview"
tags: ["architecture", "system-design", "backend"]
date: "2024-12-15"
status: "published"
---
# Project Architecture Overview`;
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({
      title: 'Project Architecture Overview',
      tags: ['architecture', 'system-design', 'backend'],
      date: '2024-12-15',
      status: 'published',
    });
  });
});
