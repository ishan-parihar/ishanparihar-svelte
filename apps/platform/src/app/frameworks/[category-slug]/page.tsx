import { notFound } from 'next/navigation';
import CategoryHero from '../../../components/frameworks/CategoryHero';
import FrameworkGrid from '../../../components/frameworks/FrameworkGrid';
import { FRAMEWORK_CATEGORIES } from '../../../lib/framework-data';
import { type FrameworkCategory } from '../../../types/framework';

interface PageProps {
  params: Promise<{ 'category-slug': string; }>;
}

export default async function FrameworkCategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams['category-slug'];
  
  // Find the matching category with explicit type annotation
  const category = FRAMEWORK_CATEGORIES.find(
    (cat: FrameworkCategory) => cat.slug === categorySlug
  );
  
  // If no matching category is found, return a 404
  if (!category) {
    return notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryHero title={category.title} description={category.description} />
      <FrameworkGrid frameworks={category.frameworks} categorySlug={categorySlug} />
    </div>
  );
}