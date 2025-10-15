import NewTestimonialsSection from "./ui/new-testimonials-section";
import { ServiceTestimonial } from "@/lib/supabase";

interface TestimonialsSectionProps {
  testimonials?: ServiceTestimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return <NewTestimonialsSection testimonials={testimonials} />;
}
