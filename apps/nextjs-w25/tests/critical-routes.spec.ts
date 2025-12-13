import { test, expect, type Page } from '@playwright/test';

const routeCases: Array<{ path: string; assertion: (page: Page) => Promise<void> }> = [
  {
    path: '/',
    assertion: async (page) => {
      await expect(page).toHaveURL(/\/new-work/);
      await expect(page.getByRole('navigation').first()).toBeVisible();
    },
  },
  {
    path: '/login',
    assertion: async (page) => {
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
      await expect(page.getByRole('main').getByRole('button', { name: 'Login' })).toBeEnabled();
    },
  },
  {
    path: '/register',
    assertion: async (page) => {
      await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
      await expect(page.getByRole('main').getByRole('button', { name: 'Register' })).toBeEnabled();
    },
  },
];

test.describe('critical routes', () => {
  for (const { path, assertion } of routeCases) {
    test(`renders ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.ok()).toBeTruthy();
      await assertion(page);
    });
  }
});
