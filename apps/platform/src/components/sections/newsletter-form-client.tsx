"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { api } from "@/lib/trpc-client";
import { toast } from "sonner";
import { trackNewsletterSubscription } from "@/lib/analytics";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function NewsletterFormClient() {
  const [email, setEmail] = useState("");

  // tRPC mutation for newsletter subscription
  const subscribeMutation = api.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Thank you for subscribing!");
      setEmail("");
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred.");
    },
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Use tRPC mutation for newsletter subscription
    subscribeMutation.mutate({ email }, {
      onSuccess: () => {
        toast.success("Thank you for subscribing!");
        setEmail("");
        // Track newsletter subscription
        trackNewsletterSubscription(email);
      },
      onError: (error) => {
        toast.error(error.message || "An error occurred.");
      },
    });
  };

  return (
    <motion.div variants={fadeUp} className="space-y-6">
      <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-6">
        Join Our Newsletter
      </h3>

      <form className="space-y-3" onSubmit={handleSubscribe}>
        <div className="relative">
          <motion.div
            className="absolute -inset-0.5 rounded-none bg-gradient-to-r from-primary-400/30 to-primary-600/30 opacity-0 group-hover:opacity-100 blur-md transition duration-500"
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0, 0.15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <div className="relative">
            <Input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300/80 dark:border-slate-700/80 focus:border-primary-500 dark:focus:border-primary-400 pl-10 py-2.5 rounded-none text-slate-900 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribeMutation.isPending}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-2.5 rounded-none relative overflow-hidden shadow-md border border-primary-500/50"
            disabled={subscribeMutation.isPending}
          >
            {subscribeMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Subscribing...
              </span>
            ) : (
              "Subscribe"
            )}
          </Button>
        </motion.div>
      </form>

      <div className="flex flex-col space-y-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Get insights on spiritual growth and conscious evolution delivered to
          your inbox.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          You can{" "}
          <a
            href="/unsubscribe"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            unsubscribe
          </a>{" "}
          at any time.
        </p>
      </div>
    </motion.div>
  );
}
