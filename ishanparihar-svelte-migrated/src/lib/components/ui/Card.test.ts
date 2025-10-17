import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Card from './Card.svelte';

describe('Card Component', () => {
	it('renders card with all props', () => {
		const props = {
			id: 'test-card',
			title: 'Test Card',
			excerpt: 'This is a test card excerpt',
			coverImage: 'https://example.com/image.jpg',
			date: '2024-01-01',
			category: 'Technology',
			slug: 'test-card',
			premium: false,
			likes_count: 10,
			comments_count: 5,
			views_count: 100
		};

		const { getByText, getByRole } = render(Card, { props });

		expect(getByText('Test Card')).toBeInTheDocument();
		expect(getByText('This is a test card excerpt')).toBeInTheDocument();
		expect(getByText('Technology')).toBeInTheDocument();
		expect(getByText('10')).toBeInTheDocument();
		expect(getByText('5')).toBeInTheDocument();
		expect(getByText('100')).toBeInTheDocument();
		
		const image = getByRole('img');
		expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
		expect(image).toHaveAttribute('alt', 'Test Card');
	});

	it('displays premium badge for premium content', () => {
		const { getByText } = render(Card, {
			props: {
				id: 'premium-card',
				title: 'Premium Card',
				excerpt: 'Premium content',
				premium: true
			}
		});

		expect(getByText('Premium')).toBeInTheDocument();
	});

	it('hides engagement metrics when counts are zero', () => {
		const { queryByText } = render(Card, {
			props: {
				id: 'no-metrics-card',
				title: 'No Metrics Card',
				excerpt: 'No engagement metrics',
				likes_count: 0,
				comments_count: 0,
				views_count: 0
			}
		});

		expect(queryByText('0')).not.toBeInTheDocument();
	});

	it('renders correctly without cover image', () => {
		const { queryByRole } = render(Card, {
			props: {
				id: 'no-image-card',
				title: 'No Image Card',
				excerpt: 'No cover image'
			}
		});

		expect(queryByRole('img')).not.toBeInTheDocument();
	});
});
