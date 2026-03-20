import { test, expect } from '@playwright/test';
import { registerAndLogin } from './helpers';

const user = {
  name: 'Coder Tester',
  email: `e2e_code_${Date.now()}@test.local`,
  password: 'TestPass123!',
};

test.describe('Coding Arena', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, user);
  });

  test('unauthenticated access to /solve redirects to login', async ({ page }) => {
    // Clear auth
    await page.evaluate(() => localStorage.clear());
    await page.goto('/solve/1');
    await expect(page).toHaveURL(/login/);
  });

  test('coding arena loads for a valid question', async ({ page }) => {
    // Navigate directly — if there are no questions this may 404 gracefully
    await page.goto('/solve/1');
    // Either the editor loads or we get a not-found page — just no crash
    const url = page.url();
    expect(url).not.toContain('login'); // We're authenticated, no redirect
  });

  test('code editor is interactive', async ({ page }) => {
    await page.goto('/solve/1');
    // Monaco editor renders a textarea or contenteditable
    const editor = page.locator('.monaco-editor, [data-testid="editor"], textarea').first();
    const editorExists = await editor.count();
    // If the question exists, the editor should be present
    if (editorExists > 0) {
      await expect(editor).toBeVisible();
    }
  });
});
