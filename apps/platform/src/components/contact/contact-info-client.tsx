"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { sendEmailAction } from "@/app/actions/email";

const contactSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  requirements: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactInfoClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);

      // Create FormData for the Server Action
      const formData = new FormData();
      formData.append("name", data.fullName);
      formData.append("email", data.email);
      formData.append("phone", data.phone || "");
      formData.append("requirements", data.requirements || "");
      formData.append("message", data.message);

      const result = await sendEmailAction(formData);

      if (result.success) {
        toast.success(
          "Message sent successfully! I'll get back to you within 24 hours.",
        );
        reset();
      } else {
        toast.error(
          result.message || "Failed to send message. Please try again.",
        );
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-16 md:py-20 bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.1),transparent_50%)]"></div>

      <motion.div
        className="max-w-4xl mx-auto px-4 md:px-6 relative z-10"
        variants={staggerContainer as Variants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={fadeUp as Variants}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
            Let's Connect
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            I'm excited to connect with you. Share your journey and let me know
            how I can support your spiritual growth.
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          className="max-w-2xl mx-auto"
          variants={fadeUp as Variants}
          custom={1}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium mb-2"
                >
                  Full Name *
                </label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Your full name"
                  className={`w-full ${errors.fullName ? "border-red-500" : ""}`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="your@email.com"
                  className={`w-full ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-2"
                >
                  Phone Number (Optional)
                </label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Your phone number"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="requirements"
                  className="block text-sm font-medium mb-2"
                >
                  What are you looking for?
                </label>
                <Input
                  id="requirements"
                  {...register("requirements")}
                  placeholder="e.g., Life coaching, spiritual guidance..."
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2"
              >
                Tell me more about your journey *
              </label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="Share what brought you here and how I can support you..."
                rows={6}
                className={`w-full ${errors.message ? "border-red-500" : ""}`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="text-center">
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="bg-gradient-to-r from-accent-consciousness to-accent-quantum text-white hover:opacity-90 transition-opacity px-8 py-3 text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Message"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
}
