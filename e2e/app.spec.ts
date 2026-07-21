import { expect, test } from '@playwright/test';

test.describe('@sldb/ui browser flows', () => {
  test('loads the workspace, switches views, and makes fallback refresh explicit', async ({ page }) => {
    await page.route('**/api/marcado/export', async (route) => {
      await route.abort();
    });

    await page.goto('/');

    await expect(page.getByText('@sldb/ui')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Semantic Markdown ASG — Canonical Example' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SLDB validation' })).toBeVisible();

    await page.getByRole('button', { name: 'Source' }).click();
    const editor = page.getByLabel('Marcado source editor');
    await expect(editor).toBeVisible();
    await expect(editor).toContainText('Semantic Markdown ASG');

    await page.getByRole('button', { name: 'Rendered' }).click();
    await expect(page.locator('.prose-content')).toContainText('Pure trees cannot represent crossing semantic ranges cleanly.');

    await page.getByRole('button', { name: 'Refresh runtime' }).click();
    await expect(page.getByText(/Marcado runtime unavailable; refreshed canonical-example with degraded fallback parsing/i)).toBeVisible();
    await expect(page.getByText('Fallback parsing (degraded)')).toBeVisible();
  });

  test('saves and restores a local draft in a real browser session', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Source' }).click();
    const editor = page.getByLabel('Marcado source editor');
    await editor.fill('# Browser Draft\n\nBody from Playwright');

    await page.getByRole('button', { name: 'Save draft' }).click();
    await expect
      .poll(async () => page.evaluate(() => window.localStorage.getItem('marcado-ui:source:marcado-canonical-example')))
      .toContain('Browser Draft');

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(editor).toContainText('Semantic Markdown ASG');

    await page.getByRole('button', { name: 'Load draft' }).click();
    await expect(editor).toHaveValue('# Browser Draft\n\nBody from Playwright');
  });
});
