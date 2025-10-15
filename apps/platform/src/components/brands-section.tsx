import { BrandsSectionClient } from "@/components/sections/brands-section-client";

const brands = [
  {
    name: "Forbes",
    slotId: "brand-logo-forbes",
    description:
      "Featured in Forbes for innovative approaches to personal development",
    category: "Business & Leadership",
  },
  {
    name: "Mindbodygreen",
    slotId: "brand-logo-mindbodygreen",
    description: "Regular contributor on mindfulness and spiritual growth",
    category: "Wellness & Lifestyle",
  },
  {
    name: "Well+Good",
    slotId: "brand-logo-wellgood",
    description:
      "Expert insights on holistic wellness and personal transformation",
    category: "Health & Wellness",
  },
  {
    name: "Goop",
    slotId: "brand-logo-goop",
    description: "Featured spiritual guide and wellness expert",
    category: "Lifestyle & Wellness",
  },
  {
    name: "Thrive Global",
    slotId: "brand-logo-thrive",
    description: "Contributing author on personal growth and well-being",
    category: "Personal Development",
  },
];

export function BrandsSection() {
  return <BrandsSectionClient brands={brands} />;
}
