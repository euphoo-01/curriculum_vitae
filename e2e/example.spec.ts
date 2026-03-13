import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await page.waitForLoadState('networkidle');

  await expect(
    page.getByText('Добро пожаловать', { exact: false })
  ).toBeVisible();
});
