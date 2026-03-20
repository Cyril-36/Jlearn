import { test, expect } from '@playwright/test';
import { TEST_USER, registerAndLogin, login, logout } from './helpers';

// Each test gets a unique email to avoid conflicts
const user = {
  ...TEST_USER,
  email: `e2e_auth_${Date.now()}@test.local`,
};

test.describe('Authentication', () => {
  test('signup → lands on dashboard', async ({ page }) => {
    await registerAndLogin(page, user);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/welcome/i).or(page.getByText(user.name))).toBeVisible();
  });

  test('login with valid credentials', async ({ page }) => {
    // First register
    await registerAndLogin(page, user);
    await logout(page);

    // Then login
    await login(page, user.email, user.password);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill(user.email);
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/failed|invalid|incorrect/i)).toBeVisible();
  });

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await logout(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('forgot password link navigates to forgot-password page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /forgot/i }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('forgot password form submits and shows confirmation', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder('you@example.com').fill('any@test.local');
    await page.getByRole('button', { name: /send reset link/i }).click();
    // The backend always shows success to avoid user enumeration
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test('signup with duplicate email shows error', async ({ page }) => {
    await registerAndLogin(page, user);
    await logout(page);

    await page.goto('/signup');
    await page.getByPlaceholder('Your name').fill(user.name);
    await page.getByPlaceholder('you@example.com').fill(user.email);
    await page.getByPlaceholder(/password/i).fill(user.password);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/already|exists|registered/i)).toBeVisible();
  });

  test('signup with short password shows validation error', async ({ page }) => {
    await page.goto('/signup');
    await page.getByPlaceholder('Your name').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(`short_pw_${Date.now()}@test.local`);
    await page.getByPlaceholder(/password/i).fill('short');
    await page.getByRole('button', { name: /create account/i }).click();
    // Either HTML5 validation or API error
    const isInvalid = await page.locator('input:invalid').count();
    if (isInvalid === 0) {
      await expect(page.getByText(/8 characters|too short/i)).toBeVisible();
    }
  });
});
