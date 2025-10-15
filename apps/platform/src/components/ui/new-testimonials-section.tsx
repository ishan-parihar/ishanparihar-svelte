import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";
import { ServiceTestimonial } from "@/lib/supabase";

// Interface for testimonial data
interface TestimonialData {
  text: string;
  image: string;
  name: string;
  role: string;
}

// Props interface for the component
interface NewTestimonialsSectionProps {
  testimonials?: ServiceTestimonial[];
  title?: string;
  subtitle?: string;
  sectionTitle?: string;
}

// Transform service testimonials to the format expected by TestimonialsColumn
const transformServiceTestimonials = (
  serviceTestimonials: ServiceTestimonial[],
): TestimonialData[] => {
  return serviceTestimonials.map((testimonial) => ({
    text: testimonial.testimonial_text,
    image:
      testimonial.client_image ||
      `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face`,
    name: testimonial.client_name,
    role:
      [testimonial.client_title, testimonial.client_company]
        .filter(Boolean)
        .join(", ") || "Client",
  }));
};

const NewTestimonialsSection = ({
  testimonials: propTestimonials,
  title = "What our clients say",
  subtitle = "Discover how individuals from diverse backgrounds have transformed their lives through our guidance and teachings.",
  sectionTitle = "Testimonials",
}: NewTestimonialsSectionProps) => {
  // Transform service testimonials to the format expected by TestimonialsColumn
  // If no testimonials are provided, use an empty array
  const testimonialsToUse: TestimonialData[] = propTestimonials 
    ? transformServiceTestimonials(propTestimonials)
    : [];

  // If we don't have any testimonials, don't render the section
  if (testimonialsToUse.length === 0) {
    return null;
  }

  const firstColumn = testimonialsToUse.slice(0, 3);
  const secondColumn = testimonialsToUse.slice(3, 6);
  const thirdColumn = testimonialsToUse.slice(6, 9);
  
  return (
    <section className="h-full w-full flex flex-col items-center justify-center relative py-16 md:py-24">
      <div className="container z-10 mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-none">{sectionTitle}</div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mt-6 mb-6">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-secondary leading-relaxed max-w-3xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
};

export default NewTestimonialsSection;
