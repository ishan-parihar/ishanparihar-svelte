"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
} from "lucide-react";
import {
  textReveal,
  textMask,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

export function AboutHeroClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section className="relative h-[calc(100vh-60px)] lg:h-[calc(100vh-70px)] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background/90 backdrop-blur-sm z-10"></div>
        <Image
          src="/default-hero-background.jpg"
          alt="Ishan Parihar"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{
            transform: `scale(${imageScale.get()})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent z-20"></div>
      </div>
      <div className="w-full relative z-20 mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 flex items-center justify-center space-x-2 text-sm text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>About | Ishan Parihar</span>
          </motion.div>

          <motion.h1
            variants={textReveal as Variants}
            initial="hidden"
            animate="visible"
            className="mb-8 text-5xl md:text-6xl lg:text-7xl font-bold text-gradient leading-tight"
          >
            A Journey of Transformation
          </motion.h1>

          <motion.p
            variants={textMask as Variants}
            initial="hidden"
            animate="visible"
            className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            From the depths of personal struggle to the heights of conscious
            living, discover how I've transformed my life and now guide others
            on their path to awakening.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="#journey">
              <Button className="w-full sm:w-auto rounded-full bg-primary px-8 py-6 text-lg text-white hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                Explore My Journey
              </Button>
            </Link>
            <Link href="/blog/my-story">
              <Button className="w-full sm:w-auto rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 px-8 py-6 text-lg text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-lg shadow-black/10">
                Read My Story
              </Button>
            </Link>
          </motion.div>

          {/* Social Stats */}
          <motion.div
            variants={staggerContainer as Variants}
            initial="hidden"
            animate="visible"
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {[
              { label: "YouTube Subscribers", value: "10K+", icon: Youtube },
              {
                label: "Instagram Followers",
                value: "25K+",
                icon: Instagram,
              },
              { label: "Success Rate", value: "95%", icon: Linkedin },
              { label: "Years of Experience", value: "5+", icon: Twitter },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={staggerItem as Variants}
                className="text-center glassmorphism p-6 rounded-xl hover:scale-105 transition-all duration-300 group"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                <div className="text-3xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Links */}
          <motion.div
            variants={staggerContainer as Variants}
            initial="hidden"
            animate="visible"
            className="mt-12 flex justify-center space-x-6"
          >
            {[
              {
                icon: Youtube,
                href: "https://youtube.com/@ishanparihar",
                label: "YouTube",
              },
              {
                icon: Instagram,
                href: "https://instagram.com/ishanparihar",
                label: "Instagram",
              },
              {
                icon: Twitter,
                href: "https://twitter.com/ishanparihar",
                label: "Twitter",
              },
              {
                icon: Linkedin,
                href: "https://linkedin.com/in/ishanparihar",
                label: "LinkedIn",
              },
            ].map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={staggerItem as Variants}
                className="text-muted-foreground hover:text-primary transition-colors glassmorphism p-3 rounded-full hover:scale-110 group"
                aria-label={social.label}
              >
                <social.icon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm text-muted-foreground">
            Scroll to explore
          </span>
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
