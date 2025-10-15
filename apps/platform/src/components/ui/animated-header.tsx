"use client";

import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HeaderLogo } from "@/components/ui/brand-logo";

// Define TypeScript interfaces for menu items and component props
interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactElement;
  items?: MenuItem[];
}

interface AnimatedHeaderProps {
  logo?: {
    component?: React.ComponentType<any>;
    url?: string;
    src?: string;
    alt?: string;
    title?: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
}

// Framer Motion transition settings for smooth animations
const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const AnimatedHeader = ({
  logo = {
    component: HeaderLogo,
    url: "/",
    title: "Ishan Parihar",
  },
  menu = [
    {
      title: "About",
      url: "/about",
      items: [
        { title: "Framework", description: "Our methodology and approach", icon: <Book />, url: "/framework" },
        { title: "Offerings", description: "Services and solutions", icon: <Trees />, url: "/offerings" },
      ],
    },
    { title: "Blog", url: "/blog" },
    { title: "Assessments", url: "/assessments" },
  ],
  mobileExtraLinks = [],
  auth = {
    login: { text: "Log in", url: "/auth/login" },
    signup: { text: "Sign up", url: "/auth/signup" },
  },
}: AnimatedHeaderProps) => {
  const [active, setActive] = useState<string | null>(null);

  const LogoComponent = logo.component || HeaderLogo;

  return (
    <section className="py-4">
      <div className="container">
        {/* --- Desktop Navigation --- */}
        <nav
          className="hidden justify-between items-center lg:flex"
          onMouseLeave={() => setActive(null)} // Reset active item on mouse leave
        >
          <div className="flex items-center gap-8">
            <LogoComponent />
            <div className="flex items-center gap-2">
              {menu.map((item) => (
                <div
                  key={item.title}
                  onMouseEnter={() => setActive(item.title)}
                  className="relative"
                >
                  <motion.a
                    href={item.url}
                    className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-accent-foreground p-3"
                  >
                    {item.title}
                  </motion.a>
                  {active === item.title && item.items && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={transition}
                      className="absolute top-[calc(100%_+_0.5rem)] left-1/2 transform -translate-x-1/2"
                    >
                      <motion.div
                        layoutId="active"
                        className="bg-background rounded-2xl overflow-hidden border shadow-xl"
                      >
                        <div className="w-max h-full p-3">
                          <ul>
                            {item.items.map((subItem) => (
                              <li key={subItem.title}>
                                <a
                                  className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted"
                                  href={subItem.url}
                                >
                                  <div className="text-muted-foreground">{subItem.icon}</div>
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">
                                      {subItem.title}
                                    </div>
                                    <p className="text-sm leading-snug text-muted-foreground">
                                      {subItem.description}
                                    </p>
                                  </div>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={auth.login.url}>{auth.login.text}</a>
            </Button>
            <Button asChild size="sm">
              <a href={auth.signup.url}>{auth.signup.text}</a>
            </Button>
          </div>
        </nav>

        {/* --- Mobile Navigation (Sheet) --- */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <LogoComponent />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <LogoComponent />
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6">
                  <Accordion type="single" collapsible className="w-full">
                    {menu.map((item) =>
                      item.items ? (
                        <AccordionItem key={item.title} value={item.title} className="border-b-0">
                          <AccordionTrigger className="font-semibold hover:no-underline">
                            {item.title}
                          </AccordionTrigger>
                          <AccordionContent className="mt-2">
                            {item.items.map((subItem) => (
                              <a
                                key={subItem.title}
                                className="flex gap-4 rounded-md p-3"
                                href={subItem.url}
                              >
                                {subItem.icon}
                                <span className="font-semibold">{subItem.title}</span>
                              </a>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ) : (
                        <a key={item.title} href={item.url} className="block font-semibold py-4">
                          {item.title}
                        </a>
                      )
                    )}
                  </Accordion>
                  <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                    <Button asChild variant="outline">
                      <a href={auth.login.url}>{auth.login.text}</a>
                    </Button>
                    <Button asChild>
                      <a href={auth.signup.url}>{auth.signup.text}</a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};
