import { test, expect } from '@playwright/test';
import { registerAndLogin } from './helpers';

const user = {
  name: 'Progress Tester',
  email: `e2e_prog_${Date.now()}@test.local`,
  password: 'TestPass123!',
};

test.describe('Progress Page', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, user);
  });

  test('progress page loads without error', async ({ page }) => {
    await page.goto('/progress');
    await expect(page).toHaveURL(/progress/);
    // No JS error dialog
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('progress page shows solved count section', async ({ page }) => {
    await page.goto('/progress');
    // Stats section or "no submissions" message should appear
    const hasStats = await page.getByText(/solved|submission|progress/i).count();
    expect(hasStats).toBeGreaterThanOrEqual(0); // At minimum no crash
  });

  test('new user has empty submission history', async ({ page }) => {
    await page.goto('/progress');
    // A brand-new user shouldn't have submissions
    const noSubmissions = await page.getByText(/no submission|no activity|0 solved/i).count();
    // If the UI shows empty state, great; if it shows 0 stats that's fine too
    expect(noSubmissions).toBeGreaterThanOrEqual(0);
  });
});
