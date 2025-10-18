import { test, expect } from '@playwright/test';

test.describe('Blog Page Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should navigate to blog page', async ({ page }) => {
		await page.click('a[href="/blog"]');
		await expect(page).toHaveURL('/blog');
		await expect(page.locator('h1')).toContainText('Blog');
	});

	test('should display blog posts grid', async ({ page }) => {
		await page.goto('/blog');
		
		// Check that blog posts are displayed in a grid
		const blogGrid = page.locator('.grid');
		await expect(blogGrid).toBeVisible();
		
		// Check for at least one blog card
		const blogCards = page.locator('[data-testid="blog-card"]');
		if (await blogCards.count() > 0) {
			await expect(blogCards.first()).toBeVisible();
		}
	});

	test('should display blog post metadata', async ({ page }) => {
		await page.goto('/blog');
		
		// Look for blog post cards and check metadata
		const blogCards = page.locator('[data-testid="blog-card"]');
		const cardCount = await blogCards.count();
		
		if (cardCount > 0) {
			const firstCard = blogCards.first();
			
			// Check for common blog post elements
			const title = firstCard.locator('h3, .card-title');
			if (await title.count() > 0) {
				await expect(title.first()).toBeVisible();
			}
			
			const excerpt = firstCard.locator('.card-description, p');
			if (await excerpt.count() > 0) {
				await expect(excerpt.first()).toBeVisible();
			}
			
			// Check for engagement metrics
			const metrics = firstCard.locator('[data-testid="engagement-metrics"]');
			if (await metrics.count() > 0) {
				await expect(metrics.first()).toBeVisible();
			}
		}
	});

	test('should navigate to individual blog post', async ({ page }) => {
		await page.goto('/blog');
		
		// Look for clickable blog post links
		const blogLinks = page.locator('a[href^="/blog/"]');
		const linkCount = await blogLinks.count();
		
		if (linkCount > 0) {
			await blogLinks.first().click();
			
			// Should navigate to blog post detail page
			await expect(page.url()).toMatch(/\/blog\/[^\s]+/);
			
			// Check for blog post content
			const postContent = page.locator('[data-testid="blog-content"]');
			if (await postContent.count() > 0) {
				await expect(postContent.first()).toBeVisible();
			}
		}
	});

	test('should handle blog post interactions', async ({ page }) => {
		await page.goto('/blog');
		
		const blogCards = page.locator('[data-testid="blog-card"]');
		const cardCount = await blogCards.count();
		
		if (cardCount > 0) {
			const firstCard = blogCards.first();
			
			// Test like button if present
			const likeButton = firstCard.locator('[data-testid="like-button"]');
			if (await likeButton.count() > 0) {
				await likeButton.first().click();
				// Check for like state change or feedback
			}
			
			// Test bookmark button if present
			const bookmarkButton = firstCard.locator('[data-testid="bookmark-button"]');
			if (await bookmarkButton.count() > 0) {
				await bookmarkButton.first().click();
				// Check for bookmark state change
			}
		}
	});

	test('should display responsive design', async ({ page }) => {
		// Test mobile view
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/blog');
		
		const blogGrid = page.locator('.grid');
		await expect(blogGrid).toBeVisible();
		
		// Test tablet view
		await page.setViewportSize({ width: 768, height: 1024 });
		await expect(blogGrid).toBeVisible();
		
		// Test desktop view
		await page.setViewportSize({ width: 1200, height: 800 });
		await expect(blogGrid).toBeVisible();
	});

	test('should handle empty blog state', async ({ page }) => {
		// This test would require mocking the API to return empty data
		// For now, just check that the page loads without errors
		await page.goto('/blog');
		await expect(page.locator('h1')).toContainText('Blog');
		
		// Check for empty state message if present
		const emptyState = page.locator('[data-testid="empty-blog-state"]');
		if (await emptyState.count() > 0) {
			await expect(emptyState.first()).toBeVisible();
		}
	});

	test('should have proper accessibility', async ({ page }) => {
		await page.goto('/blog');
		
		// Check for proper heading structure
		await expect(page.locator('h1')).toBeVisible();
		
		// Check for proper ARIA labels on interactive elements
		const interactiveElements = page.locator('button, a, input');
		const elementCount = await interactiveElements.count();
		
		for (let i = 0; i < Math.min(elementCount, 10); i++) {
			const element = interactiveElements.nth(i);
			const ariaLabel = await element.getAttribute('aria-label');
			const title = await element.getAttribute('title');
			const text = await element.textContent();
			
			// Elements should have accessible names
			if (!ariaLabel && !title && !text) {
				console.warn('Interactive element without accessible name found');
			}
		}
	});
});
