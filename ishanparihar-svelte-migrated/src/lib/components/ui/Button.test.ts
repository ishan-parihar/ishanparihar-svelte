import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button.svelte';

describe('Button Component', () => {
	it('renders with default variant', () => {
		const { getByRole } = render(Button, {
			props: {},
			slots: {
				default: 'Test Button'
			}
		});

		const button = getByRole('button');
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent('Test Button');
		expect(button).toHaveClass('bg-primary');
	});

	it('renders with different variants', () => {
		const variants = ['secondary', 'outline', 'ghost', 'destructive'];

		variants.forEach(variant => {
			const { getByRole } = render(Button, {
				props: { variant },
				slots: {
					default: `${variant} Button`
				}
			});

			const button = getByRole('button');
			if (variant === 'secondary') {
				expect(button).toHaveClass('bg-secondary');
			} else if (variant === 'outline') {
				expect(button).toHaveClass('border', 'border-input');
			} else if (variant === 'ghost') {
				expect(button).toHaveClass('hover:bg-accent');
			} else if (variant === 'destructive') {
				expect(button).toHaveClass('bg-destructive');
			}
		});
	});

	it('handles click events', async () => {
		const handleClick = vi.fn();
		const { getByRole } = render(Button, {
			props: {
				onclick: handleClick
			},
			slots: {
				default: 'Click Me'
			}
		});

		const button = getByRole('button');
		await fireEvent.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('can be disabled', () => {
		const { getByRole } = render(Button, {
			props: {
				disabled: true
			},
			slots: {
				default: 'Disabled Button'
			}
		});

		const button = getByRole('button');
		expect(button).toBeDisabled();
		expect(button).toHaveClass('disabled:opacity-50');
	});

	it('renders with different sizes', () => {
		const sizes = ['sm', 'lg', 'icon'];

		sizes.forEach(size => {
			const { getByRole } = render(Button, {
				props: { size },
				slots: {
					default: `${size} Button`
				}
			});

			const button = getByRole('button');
			if (size === 'sm') {
				expect(button).toHaveClass('h-9');
			} else if (size === 'lg') {
				expect(button).toHaveClass('h-11');
			} else if (size === 'icon') {
				expect(button).toHaveClass('h-10', 'w-10');
			}
		});
	});
});
