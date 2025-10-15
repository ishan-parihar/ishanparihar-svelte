import Image from "next/image";

interface Brand {
  name: string;
  imageUrl: string;
  description: string;
  category: string;
}

interface BrandsSectionServerProps {
  brands: Brand[];
}

/**
 * Server-side version of the Brands Section that displays brand logos
 */
export async function BrandsSectionServer({
  brands,
}: BrandsSectionServerProps) {
  return (
    <section className="w-full py-12 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Trusted by Brands
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              We've worked with some of the best brands in the industry.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-black shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-200 dark:border-neutral-800 rounded-none p-6 flex flex-col items-center text-center"
            >
              <div className="relative w-28 h-14 mb-4">
                <Image
                  src={brand.imageUrl}
                  alt={brand.name}
                  fill
                  className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                  {brand.name}
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {brand.description}
                </p>
                <span className="text-xs text-neutral-900 dark:text-neutral-100">
                  {brand.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
