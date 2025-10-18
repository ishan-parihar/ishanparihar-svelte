import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import { vi } from 'vitest';

// Mock SvelteKit runtime
vi.mock('$app/environment', () => ({
	browser: true,
	dev: true,
	building: false,
	version: '1.0.0'
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn()
}));

vi.mock('$app/stores', () => ({
	page: { subscribe: vi.fn() },
	navigating: { subscribe: vi.fn() },
	updated: { subscribe: vi.fn() }
}));

// Reset all mocks before each test
beforeEach(() => {
	vi.clearAllMocks();
});
