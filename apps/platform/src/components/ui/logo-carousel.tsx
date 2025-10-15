"use client";

import { useEffect, useState, useMemo, forwardRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { TextRoll } from "./text-roll"; // Assuming text-roll.tsx is in the same directory

interface AnimatedCarouselProps {
  title?: string;
  animatedWords?: string[]; // Array of words to transition through
  animationInterval?: number; // Interval for word transitions
  logoCount?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  logos?: string[] | null; // Array of image URLs
  containerClassName?: string;
  titleClassName?: string;
  carouselClassName?: string;
  logoClassName?: string;
  itemsPerViewMobile?: number;
  itemsPerViewDesktop?: number;
  spacing?: string;
  padding?: string;
  // New logo size customization props
  logoContainerWidth?: string;
  logoContainerHeight?: string;
  logoImageWidth?: string;
  logoImageHeight?: string;
  logoMaxWidth?: string;
  logoMaxHeight?: string;
  // Props for intersection observer
  inView?: boolean;
}

export const AnimatedCarousel = forwardRef<HTMLElement, AnimatedCarouselProps>(
  (
    {
      title = "Trusted by thousands of businesses worldwide",
      animatedWords, // Array of words to transition through
      animationInterval = 3000, // Interval for word transitions
      logoCount = 15,
      autoPlay = true,
      autoPlayInterval = 1000,
      logos = null, // Array of image URLs
      containerClassName = "",
      titleClassName = "",
      carouselClassName = "",
      logoClassName = "",
      itemsPerViewMobile = 4,
      itemsPerViewDesktop = 6,
      spacing = "gap-10",
      padding = "py-20 lg:py-40",
      // New logo size customization props
      logoContainerWidth = "w-48",
      logoContainerHeight = "h-24",
      logoImageWidth = "w-full",
      logoImageHeight = "h-full",
      logoMaxWidth = "",
      logoMaxHeight = "",
      // Props for intersection observer
      inView = true, // Default to true for backward compatibility
    },
    ref,
  ) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    // For transitioning words
    const [wordIndex, setWordIndex] = useState(0);
    const words = useMemo(() => animatedWords || [], [animatedWords]);

    // Carousel auto-play effect
    useEffect(() => {
      if (!api || !autoPlay || !inView) {
        return;
      }

      const timer = setTimeout(() => {
        if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
          setCurrent(0);
          api.scrollTo(0);
        } else {
          api.scrollNext();
          setCurrent(current + 1);
        }
      }, autoPlayInterval);

      return () => clearTimeout(timer);
    }, [api, current, autoPlay, autoPlayInterval, inView]);

    // Word transition effect - only run when in view
    useEffect(() => {
      if (!animatedWords || animatedWords.length === 0 || !inView) {
        return;
      }

      const timer = setTimeout(() => {
        if (wordIndex === words.length - 1) {
          setWordIndex(0);
        } else {
          setWordIndex(wordIndex + 1);
        }
      }, animationInterval);

      return () => clearTimeout(timer);
    }, [wordIndex, words, animationInterval, animatedWords, inView]);

    const logoItems =
      logos ||
      Array.from(
        { length: logoCount },
        (_, i) =>
          `https://th.bing.com/th/id/R.4aa108082e7d3cbd55add79f84612aaa?rik=I4dbPhSe%2fbHHSg&riu=http%3a%2f%2fpurepng.com%2fpublic%2fuploads%2flarge%2fpurepng.com-google-logo-2015brandlogobrand-logoiconssymbolslogosgoogle-6815229372333mqrr.png&ehk=ewmaCOvP0Ji4QViEJnxSdlrYUrTSTWhi8nZ9XdyCgAI%3d&risl=&pid=ImgRaw&r=0100x100?text=Logo+${i + 1}`,
      );

    // Combine logo image size classes
    const logoImageSizeClasses =
      `${logoImageWidth} ${logoImageHeight} ${logoMaxWidth} ${logoMaxHeight}`.trim();

    return (
      <motion.section
        ref={ref}
        className={`w-full ${padding} ${containerClassName}`}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="w-full max-w-none px-4 md:px-6">
          <div className={`flex flex-col ${spacing} w-full`}>
            <div className="text-center mb-8 overflow-visible">
              <h2
                className={`text-3xl md:text-4xl lg:text-5xl tracking-tight font-bold text-black dark:text-white leading-tight ${titleClassName}`}
              >
                {animatedWords && animatedWords.length > 0 ? (
                  <span className="flex flex-wrap justify-center items-baseline gap-2 md:gap-3 min-h-[1.2em] py-2">
                    {title.split(" ").map((word, index) => {
                      // Check if this word should be animated
                      const isAnimatedWord = animatedWords.some(
                        (animWord) =>
                          word.toLowerCase().includes(animWord.toLowerCase()) ||
                          animWord.toLowerCase().includes(word.toLowerCase()),
                      );

                      if (isAnimatedWord) {
                        // Find the longest word to set proper width
                        const longestWord = words.reduce(
                          (a, b) => (a.length > b.length ? a : b),
                          "",
                        );
                        return (
                          <span
                            key={index}
                            className="relative inline-block min-h-[1.2em] overflow-visible"
                          >
                            <span
                              className="invisible font-bold"
                              style={{
                                minWidth: `${longestWord.length * 0.6}em`,
                              }}
                            >
                              {longestWord}
                            </span>
                            <span className="absolute inset-0 flex justify-center items-baseline overflow-visible">
                              {words.map((animWord, wordIdx) => (
                                <motion.span
                                  key={wordIdx}
                                  className="absolute font-bold text-[#00d4ff] dark:text-[#00d4ff] whitespace-nowrap"
                                  initial={{ opacity: 0, y: "100%" }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 60,
                                    damping: 15,
                                    duration: 0.6,
                                  }}
                                  animate={
                                    inView && wordIndex === wordIdx
                                      ? {
                                          y: 0,
                                          opacity: 1,
                                        }
                                      : {
                                          y:
                                            wordIndex > wordIdx
                                              ? "-100%"
                                              : "100%",
                                          opacity: 0,
                                        }
                                  }
                                >
                                  {animWord}
                                </motion.span>
                              ))}
                            </span>
                          </span>
                        );
                      } else {
                        return (
                          <TextRoll
                            key={index}
                            duration={0.8}
                            getEnterDelay={(i) => i * 0.03}
                            getExitDelay={(i) => i * 0.03}
                            className="text-black dark:text-white"
                          >
                            {word}
                          </TextRoll>
                        );
                      }
                    })}
                  </span>
                ) : (
                  <TextRoll
                    duration={0.8}
                    getEnterDelay={(i) => i * 0.03}
                    getExitDelay={(i) => i * 0.03}
                    className="text-black dark:text-white"
                  >
                    {title}
                  </TextRoll>
                )}
              </h2>
            </div>

            <div className="w-full">
              <Carousel
                setApi={setApi}
                className={`w-full ${carouselClassName}`}
                opts={{
                  align: "center",
                  loop: true,
                }}
              >
                <CarouselContent className="-ml-1 md:-ml-2">
                  {logoItems.map((logo, index) => (
                    <CarouselItem
                      className={`pl-1 md:pl-2 basis-1/${itemsPerViewMobile} md:basis-1/${Math.min(itemsPerViewDesktop, 7)}`}
                      key={index}
                    >
                      <div
                        className={`flex ${logoContainerWidth} ${logoContainerHeight} items-center justify-center p-3 md:p-4 transition-all duration-300 ${logoClassName}`}
                      >
                        <Image
                          src={typeof logo === "string" ? logo : logo}
                          alt={`Logo ${index + 1}`}
                          width={120}
                          height={40}
                          className={`${logoImageSizeClasses} object-contain filter brightness-0 dark:invert transition-all duration-300 hover:scale-110 hover:opacity-70`}
                          unoptimized
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </div>
      </motion.section>
    );
  },
);

// Add display name for better debugging
AnimatedCarousel.displayName = "AnimatedCarousel";

export const Case1 = (props: any) => {
  return <AnimatedCarousel {...props} />;
};

// Legacy LogoCarousel component for backward compatibility
interface Logo {
  id: number;
  name: string;
  src: string;
}

interface LogoCarouselProps {
  columns?: number;
  logos: Logo[];
}

export function LogoCarousel({ logos }: LogoCarouselProps) {
  // Convert to new AnimatedCarousel format
  const logoUrls = logos.map((logo) => logo.src);

  return (
    <AnimatedCarousel
      title="Featured In"
      logos={logoUrls}
      autoPlay={true}
      autoPlayInterval={4000}
      itemsPerViewMobile={3}
      itemsPerViewDesktop={5}
      logoContainerWidth="w-40"
      logoContainerHeight="h-20"
      logoImageWidth="w-auto"
      logoImageHeight="h-10"
      padding="py-8"
    />
  );
}
