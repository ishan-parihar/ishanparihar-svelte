"use client";
import React, { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FooterLogo } from "./brand-logo";
import { NewsletterFormClient } from "../sections/newsletter-form-client";
import { motion } from "framer-motion";
import { AmbientLight } from "@/components/ui/ambient-light";

// Dynamic import for framer-motion component with ssr: false
const DynamicSocialLinks = dynamic(
  () =>
    import("../sections/social-links-client").then((mod) => ({
      default: mod.SocialLinksClient,
    })),
  { ssr: false },
);

interface LinkItem {
  href: string;
  label: string;
}

interface AnimatedFooterProps {
  leftLinks?: LinkItem[];
  rightLinks?: LinkItem[];
  copyrightText?: string;
}

const AnimatedFooter: React.FC<AnimatedFooterProps> = ({
  leftLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/shipping", label: "Digital Delivery" },
    { href: "/contact", label: "Contact Us" },
  ],
  rightLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/assessments", label: "Assessments" },
    { href: "/framework", label: "Framework" },
    { href: "/offerings", label: "Offerings" },
    { href: "/#contact", label: "Contact" },
  ],
  copyrightText = "Ishan Parihar. All rights reserved.",
}) => {
  const footerRef = useRef<HTMLDivElement | null>(null);
  const currentYear = new Date().getFullYear();

  // Business-focused footer organization
  const footerSections = {
    company: {
      title: "Company",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/framework", label: "Our Framework" },
        { href: "/blog", label: "Blog & Insights" },
        { href: "/#contact", label: "Contact" },
      ]
    },
    services: {
      title: "Services",
      links: [
        { href: "/offerings", label: "All Offerings" },
        { href: "/assessments", label: "Assessments" },
        { href: "/offerings?category=coaching", label: "Coaching" },
        { href: "/offerings?category=workshops", label: "Workshops" },
      ]
    },
    resources: {
      title: "Resources",
      links: [
        { href: "/blog", label: "Articles" },
        { href: "/framework", label: "Methodology" },
        { href: "/assessments", label: "Self-Assessment" },
        { href: "/#faq", label: "FAQ" },
      ]
    },
    legal: {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/shipping", label: "Digital Delivery" },
        { href: "/cookies", label: "Cookie Policy" },
      ]
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={footerRef}
      className="relative w-full pt-12 pb-12 z-10 border-t border-border overflow-hidden bg-background"
    >
      {/* Ambient light effect */}
      <AmbientLight 
        color="rgba(125, 211, 252, 0.05)" 
        intensity={0.1} 
        size={300} 
        speed={0.2}
      />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-accent/5"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 60 + 10}px`,
              height: `${Math.random() * 60 + 10}px`,
            }}
            initial={{ 
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: [0, 0.2, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="w-full max-w-none mx-auto px-4 md:px-6 relative z-10">
        {/* Main Footer Content - Balanced 5-Column Layout Updated */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 mb-16">
            {/* Company Section */}
            <motion.div 
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <motion.h3 
                  className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {footerSections.company.title}
                </motion.h3>
                <ul className="space-y-3">
                  {footerSections.company.links.map((link, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index + 0.2 }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:pl-1 inline-flex items-center group"
                      >
                        <motion.span 
                          className="w-0 h-px bg-primary-400 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"
                          whileHover={{ width: 12, marginRight: 8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.span>
                        <motion.span
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {link.label}
                        </motion.span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Services Section */}
            <motion.div 
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div>
                <motion.h3 
                  className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {footerSections.services.title}
                </motion.h3>
                <ul className="space-y-3">
                  {footerSections.services.links.map((link, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index + 0.3 }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:pl-1 inline-flex items-center group"
                      >
                        <motion.span 
                          className="w-0 h-px bg-primary-400 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"
                          whileHover={{ width: 12, marginRight: 8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.span>
                        <motion.span
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {link.label}
                        </motion.span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Resources Section */}
            <motion.div 
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div>
                <motion.h3 
                  className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {footerSections.resources.title}
                </motion.h3>
                <ul className="space-y-3">
                  {footerSections.resources.links.map((link, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index + 0.4 }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:pl-1 inline-flex items-center group"
                      >
                        <motion.span 
                          className="w-0 h-px bg-primary-400 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"
                          whileHover={{ width: 12, marginRight: 8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.span>
                        <motion.span
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {link.label}
                        </motion.span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Legal Section */}
            <motion.div 
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div>
                <motion.h3 
                  className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {footerSections.legal.title}
                </motion.h3>
                <ul className="space-y-3">
                  {footerSections.legal.links.map((link, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index + 0.5 }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:pl-1 inline-flex items-center group"
                      >
                        <motion.span 
                          className="w-0 h-px bg-primary-400 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"
                          whileHover={{ width: 12, marginRight: 8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.span>
                        <motion.span
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {link.label}
                        </motion.span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <motion.div 
                  className="mt-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <motion.button
                    onClick={scrollToTop}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline inline-flex items-center transition-colors"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    Back to top
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
            
          {/* Newsletter Section - 5th Column */}
            <motion.div 
              className="space-y-5 sm:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <NewsletterFormClient />
            </motion.div>
          </div>

        {/* Large Brand Name - Center */}
        <motion.div 
          className="w-full flex mt-12 mb-8 items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-center text-3xl md:text-5xl lg:text-[8rem] xl:text-[10rem] font-headings font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-700 to-neutral-900 dark:from-neutral-300 dark:to-neutral-600 select-none"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Ishan Parihar
          </motion.h1>
        </motion.div>

        {/* Social Links - Below Brand Name */}
        <motion.div 
          className="w-full flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DynamicSocialLinks />
        </motion.div>

        {/* Copyright - Bottom */}
        <motion.div 
          className="w-full flex justify-center pt-6 border-t border-border/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground flex items-center gap-x-2">
            <svg className="size-3" viewBox="0 0 80 80">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill="currentColor"
                d="M67.4307 11.5693C52.005 -3.85643 26.995 -3.85643 11.5693 11.5693C-3.85643 26.995 -3.85643 52.005 11.5693 67.4307C26.995 82.8564 52.005 82.8564 67.4307 67.4307C82.8564 52.005 82.8564 26.995 67.4307 11.5693ZM17.9332 17.9332C29.8442 6.02225 49.1558 6.02225 61.0668 17.9332C72.9777 29.8442 72.9777 49.1558 61.0668 61.0668C59.7316 62.4019 58.3035 63.5874 56.8032 64.6232L56.8241 64.6023C46.8657 54.6439 46.8657 38.4982 56.8241 28.5398L58.2383 27.1256L51.8744 20.7617L50.4602 22.1759C40.5018 32.1343 24.3561 32.1343 14.3977 22.1759L14.3768 22.1968C15.4126 20.6965 16.5981 19.2684 17.9332 17.9332ZM34.0282 38.6078C25.6372 38.9948 17.1318 36.3344 10.3131 30.6265C7.56889 39.6809 9.12599 49.76 14.9844 57.6517L34.0282 38.6078ZM21.3483 64.0156C29.24 69.874 39.3191 71.4311 48.3735 68.6869C42.6656 61.8682 40.0052 53.3628 40.3922 44.9718L21.3483 64.0156Z"
              />
            </svg>
            © {currentYear}{" "}
            <Link href="/" className="text-foreground hover:underline">
              Ishan Parihar
            </Link>
            . All rights reserved.
          </p>
        </motion.div>
      </div>


    </footer>
  );
};

export default AnimatedFooter;
