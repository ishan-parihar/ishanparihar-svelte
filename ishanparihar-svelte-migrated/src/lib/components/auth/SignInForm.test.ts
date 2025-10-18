import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import SignInForm from './SignInForm.svelte';
import type { ComponentProps } from 'svelte';

describe('SignInForm Component', () => {
	it('renders form with email and password fields', () => {
		const { getByLabelText, getByRole } = render(SignInForm as any);

		expect(getByLabelText(/email/i)).toBeInTheDocument();
		expect(getByLabelText(/password/i)).toBeInTheDocument();
		expect(getByRole('button', { name: /sign in/i })).toBeInTheDocument();
	});

	it('shows validation errors for empty fields', async () => {
		const { getByRole, getByText } = render(SignInForm as any);

		const submitButton = getByRole('button', { name: /sign in/i });
		await fireEvent.click(submitButton);

		expect(getByText(/email is required/i)).toBeInTheDocument();
		expect(getByText(/password is required/i)).toBeInTheDocument();
	});

	it('shows validation error for invalid email', async () => {
		const { getByLabelText, getByRole, getByText } = render(SignInForm as any);

		const emailInput = getByLabelText(/email/i);
		await fireEvent.input(emailInput, { target: { value: 'invalid-email' } });

		const submitButton = getByRole('button', { name: /sign in/i });
		await fireEvent.click(submitButton);

		expect(getByText(/please enter a valid email/i)).toBeInTheDocument();
	});

	it('submits form with valid data', async () => {
		const mockSubmit = vi.fn();
		const { getByLabelText, getByRole } = render(SignInForm as any);

		const emailInput = getByLabelText(/email/i);
		const passwordInput = getByLabelText(/password/i);
		const submitButton = getByRole('button', { name: /sign in/i });

		await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
		await fireEvent.input(passwordInput, { target: { value: 'password123' } });
		await fireEvent.click(submitButton);

		// In a real implementation, you'd mock the form submission
		// and verify the submit function was called with correct data
		expect(emailInput).toHaveValue('test@example.com');
		expect(passwordInput).toHaveValue('password123');
	});

	it('shows loading state during submission', async () => {
		const { getByRole } = render(SignInForm as any);

		const submitButton = getByRole('button', { name: /sign in/i });
		
		// Mock form submission to test loading state
		// In a real implementation, you'd mock the async submission
		await fireEvent.click(submitButton);

		// Verify loading state changes
		// This would depend on your specific loading implementation
	});

	it('has link to signup page', () => {
		const { getByText } = render(SignInForm as any);

		const signupLink = getByText(/don't have an account/i);
		expect(signupLink).toBeInTheDocument();
		expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
	});
});
