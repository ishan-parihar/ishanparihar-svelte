import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should navigate to login page', async ({ page }) => {
		await page.click('a[href="/login"]');
		await expect(page).toHaveURL('/login');
		await expect(page.locator('h1')).toContainText('Sign In');
	});

	test('should show validation errors on empty form submission', async ({ page }) => {
		await page.goto('/login');
		
		await page.click('button[type="submit"]');
		
		await expect(page.locator('text=/email is required/i')).toBeVisible();
		await expect(page.locator('text=/password is required/i')).toBeVisible();
	});

	test('should show validation error for invalid email', async ({ page }) => {
		await page.goto('/login');
		
		await page.fill('input[name="email"]', 'invalid-email');
		await page.click('button[type="submit"]');
		
		await expect(page.locator('text=/please enter a valid email/i')).toBeVisible();
	});

	test('should navigate to signup page from login', async ({ page }) => {
		await page.goto('/login');
		
		await page.click('a[href="/signup"]');
		await expect(page).toHaveURL('/signup');
		await expect(page.locator('h1')).toContainText('Sign Up');
	});

	test('should display signup form', async ({ page }) => {
		await page.goto('/signup');
		
		await expect(page.locator('input[name="email"]')).toBeVisible();
		await expect(page.locator('input[name="password"]')).toBeVisible();
		await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('should validate password confirmation', async ({ page }) => {
		await page.goto('/signup');
		
		await page.fill('input[name="email"]', 'test@example.com');
		await page.fill('input[name="password"]', 'password123');
		await page.fill('input[name="confirmPassword"]', 'different-password');
		await page.click('button[type="submit"]');
		
		await expect(page.locator('text=/passwords do not match/i')).toBeVisible();
	});

	test('should show Google sign-in option', async ({ page }) => {
		await page.goto('/login');
		
		await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
	});

	test('should have proper form accessibility', async ({ page }) => {
		await page.goto('/login');
		
		// Check for proper labels
		await expect(page.locator('label[for="email"]')).toBeVisible();
		await expect(page.locator('label[for="password"]')).toBeVisible();
		
		// Check ARIA attributes
		const emailInput = page.locator('input[name="email"]');
		await expect(emailInput).toHaveAttribute('type', 'email');
		await expect(emailInput).toHaveAttribute('required');
		
		const passwordInput = page.locator('input[name="password"]');
		await expect(passwordInput).toHaveAttribute('type', 'password');
		await expect(passwordInput).toHaveAttribute('required');
	});
});
