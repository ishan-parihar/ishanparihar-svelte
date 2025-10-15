"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Stepper, { Step } from "@/components/ui/stepper";
import { sendEmailAction } from "@/app/actions/email";

const contactSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  requirements: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactStepperForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
  });

  const watchedValues = watch();

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);

      // Create FormData for the Server Action
      const formData = new FormData();
      formData.append("name", data.fullName);
      formData.append("email", data.email);
      formData.append("message", data.message);

      const result = await sendEmailAction(formData);

      if (result.success) {
        reset();
        toast.success(
          "Message sent successfully! I'll get back to you within 24 hours.",
        );
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = async (step: number) => {
    switch (step) {
      case 2:
        return await trigger(["fullName", "email"]);
      case 3:
        return await trigger(["message"]);
      default:
        return true;
    }
  };

  const handleStepChange = async (newStep: number) => {
    // Only validate when moving forward
    if (newStep > currentStep) {
      const isStepValid = await validateStep(currentStep);
      if (!isStepValid) {
        toast.error("Please fill in all required fields before continuing.");
        // Don't change the step if validation fails
        throw new Error("Validation failed");
      }
    }
    setCurrentStep(newStep);
  };

  const handleFinalStepCompleted = async () => {
    const isValid = await trigger();
    if (isValid) {
      handleSubmit(onSubmit)();
    } else {
      toast.error("Please check all required fields.");
    }
  };

  return (
    <motion.div
      className="bg-transparent rounded-none p-6 md:p-8 shadow-xl relative overflow-hidden ring-2 ring-primary/20 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Decorative background illustration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <pattern
            id="grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <Stepper
          initialStep={1}
          onStepChange={handleStepChange}
          onFinalStepCompleted={handleFinalStepCompleted}
          backButtonText="Previous"
          nextButtonText="Next"
          stepCircleContainerClassName="bg-background/50 backdrop-blur-sm border-primary/30"
          contentClassName="min-h-[300px] py-6"
        >
          <Step>
            <div className="space-y-6 text-center py-8 px-4">
              <div className="max-w-lg mx-auto">
                <motion.h2
                  className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome! Let's get started
                </motion.h2>
                <motion.p
                  className="text-muted-foreground text-lg md:text-xl leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  I'm excited to connect with you. This quick form will help me
                  understand how I can best support your spiritual journey.
                </motion.p>
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                    <span className="text-3xl">🙏</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </Step>

          <Step>
            <div className="space-y-6 py-4 px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                Personal Information
              </h2>
              <div className="max-w-md mx-auto space-y-6">
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
              </div>
            </div>
          </Step>

          <Step>
            <div className="space-y-6 py-4 px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                How can I help you?
              </h2>
              <div className="max-w-md mx-auto space-y-6">
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
                    placeholder="e.g., Life coaching, spiritual guidance, workshops..."
                    className="w-full"
                  />
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
                    rows={4}
                    className={`w-full ${errors.message ? "border-red-500" : ""}`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.message.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Step>

          <Step>
            <div className="space-y-6 text-center py-4 px-4">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Ready to Connect!
              </motion.h2>

              <motion.div
                className="bg-primary/5 rounded-none p-6 space-y-3 max-w-md mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-left space-y-2">
                  <p>
                    <strong>Name:</strong>{" "}
                    {watchedValues.fullName || "Not provided"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {watchedValues.email || "Not provided"}
                  </p>
                  {watchedValues.phone && (
                    <p>
                      <strong>Phone:</strong> {watchedValues.phone}
                    </p>
                  )}
                  {watchedValues.requirements && (
                    <p>
                      <strong>Looking for:</strong> {watchedValues.requirements}
                    </p>
                  )}
                  {watchedValues.message && (
                    <p>
                      <strong>Message:</strong>{" "}
                      {watchedValues.message.substring(0, 100)}
                      {watchedValues.message.length > 100 ? "..." : ""}
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Click "Complete" to send your message. I'll get back to you
                within 24 hours.
              </motion.p>

              {isSubmitting && (
                <motion.div
                  className="flex items-center justify-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Sending your message...</span>
                </motion.div>
              )}
            </div>
          </Step>
        </Stepper>
      </div>
    </motion.div>
  );
}
