import { Page } from '@playwright/test';

export const TEST_USER = {
  name: 'E2E Tester',
  email: `e2e_${Date.now()}@test.local`,
  password: 'TestPass123!',
};

/** Register a fresh user and land on the dashboard. Returns the user's email. */
export async function registerAndLogin(page: Page, user = TEST_USER): Promise<string> {
  await page.goto('/signup');
  await page.getByPlaceholder('Your name').fill(user.name);
  await page.getByPlaceholder('you@example.com').fill(user.email);
  await page.getByPlaceholder(/password/i).fill(user.password);
  await page.getByRole('button', { name: /create account/i }).click();
  await page.waitForURL('**/dashboard');
  return user.email;
}

/** Login with an existing account. */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard');
}

/** Clear auth state from localStorage. */
export async function logout(page: Page) {
  await page.evaluate(() => {
    ['jlearn_token', 'jlearn_user', 'jlearn_refresh', 'jlearn_is_admin'].forEach(k =>
      localStorage.removeItem(k),
    );
  });
}
