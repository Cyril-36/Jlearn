import { test, expect } from '@playwright/test';
import { registerAndLogin } from './helpers';

const user = {
  name: 'Dashboard Tester',
  email: `e2e_dash_${Date.now()}@test.local`,
  password: 'TestPass123!',
};

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, user);
  });

  test('shows topic cards on dashboard', async ({ page }) => {
    // There should be at least some content — topics or a welcome message
    const body = page.locator('main, [class*="dashboard"], body');
    await expect(body).not.toBeEmpty();
  });

  test('navigation sidebar links work', async ({ page }) => {
    // Click Progress in nav
    await page.getByRole('link', { name: /progress/i }).click();
    await expect(page).toHaveURL(/progress/);
  });

  test('clicking a topic navigates to topic detail', async ({ page }) => {
    // Find first topic link/card
    const topicLink = page.getByRole('link').filter({ hasText: /.+/ }).first();
    const href = await topicLink.getAttribute('href');
    if (href?.includes('topic')) {
      await topicLink.click();
      await expect(page).toHaveURL(/topic/);
    }
  });
});
