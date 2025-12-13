import { test, expect } from '@playwright/test';

test.describe('pdf generator', () => {
  test('reports success after generating a PDF', async ({ page }) => {
    await page.goto('/pdf-test');
    await expect(page.getByRole('heading', { name: 'PDF Generator Test' })).toBeVisible();

    await page.getByRole('button', { name: /download pdf/i }).click();

    await expect(page.getByTestId('pdf-success')).toHaveText(/Generated .+\.pdf/i);
  });
});
