"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Compass, Target, User } from "lucide-react";
import ProfileCard from "@/components/ui/ProfileCard";
import { Timeline } from "@/components/ui/timeline";
import { timelineData } from "@/data/timelineData";
import {
  AnimatedSection,
  StaggeredList,
  InteractiveCard,
} from "@/components/motion";

export default function FrameworkPage() {
  return (
    <main className="min-h-screen bg-background pt-[60px] lg:pt-[70px]">
      {/* Hero/Introduction Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
            The Framework for Integrated Living
          </h1>
          <p className="font-sans text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Moving beyond fragmented perspectives to build a life of purpose,
            power, and wholeness.
          </p>
          <div className="mt-8 h-1 w-24 bg-gradient-to-r from-accent-consciousness to-accent-quantum mx-auto rounded-full"></div>
        </AnimatedSection>
      </section>

      {/* Core Principles Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Principles
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Two foundational frameworks that provide a comprehensive map for
              understanding reality and consciousness.
            </p>
          </AnimatedSection>

          <StaggeredList
            className="grid md:grid-cols-2 gap-8"
            staggerDelay={0.2}
          >
            {/* Integral Theory Card */}
            <InteractiveCard>
              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent-consciousness/30 h-full">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-consciousness/20 to-accent-quantum/20 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-accent-consciousness" />
                  </div>
                  <CardTitle className="font-display text-2xl text-foreground">
                    The Four Quadrants: A Map for Everything
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-sans text-base leading-relaxed text-muted-foreground mb-6">
                    Integral Theory provides a comprehensive framework for
                    understanding reality through four fundamental perspectives:
                    individual interior (consciousness), individual exterior
                    (behavior), collective interior (culture), and collective
                    exterior (systems). This map helps us navigate the
                    complexity of human experience and development with clarity
                    and precision.
                  </CardDescription>
                  <Button variant="secondary" className="w-full">
                    Explore Integral Theory
                  </Button>
                </CardContent>
              </Card>
            </InteractiveCard>

            {/* Law of One Card */}
            <InteractiveCard>
              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent-quantum/30 h-full">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-quantum/20 to-accent-consciousness/20 flex items-center justify-center">
                    <Compass className="w-8 h-8 text-accent-quantum" />
                  </div>
                  <CardTitle className="font-display text-2xl text-foreground">
                    Unity & Density: The Architecture of Consciousness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-sans text-base leading-relaxed text-muted-foreground mb-6">
                    The Law of One reveals the fundamental unity underlying all
                    existence and maps the journey of consciousness through
                    eight densities of experience. This ancient wisdom provides
                    profound insights into the nature of spiritual evolution,
                    service to others, and our collective path toward unity
                    consciousness.
                  </CardDescription>
                  <Button variant="secondary" className="w-full">
                    Discover the Law of One
                  </Button>
                </CardContent>
              </Card>
            </InteractiveCard>
          </StaggeredList>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-consciousness/10 to-accent-quantum/10 rounded-lg"></div>
              <div className="relative p-8 md:p-12">
                <p className="font-sans text-lg md:text-xl leading-relaxed text-foreground">
                  We exist to bridge the gap between material success and
                  spiritual depth in the modern Indian context. Our platform
                  provides the clarity, tools, and community needed to navigate
                  complexity, achieve holistic self-actualization, and
                  consciously participate in cultural transformation.
                </p>
                <div className="mt-8">
                  <p className="font-sans text-base md:text-lg text-muted-foreground leading-relaxed">
                    Through the synthesis of timeless wisdom traditions with
                    cutting-edge developmental models, we empower individuals to
                    transcend fragmented perspectives and embrace a life of
                    integrated wholeness— where success is measured not just in
                    external achievements, but in the depth of consciousness,
                    the quality of relationships, and the positive impact on our
                    collective evolution.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* About the Founder Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              About the Founder
            </h2>
          </AnimatedSection>

          <StaggeredList
            className="grid md:grid-cols-2 gap-12 items-center"
            staggerDelay={0.3}
          >
            {/* Founder Profile Card */}
            <div className="order-2 md:order-1 flex justify-center">
              <div className="w-full max-w-sm">
                <ProfileCard
                  name="Ishan Parihar"
                  title="Spiritual Guide & Life Coach"
                  handle="integralishan"
                  status="Available"
                  contactText="Connect"
                  avatarUrl="/uploads/default-blog-image.jpg"
                  showUserInfo={true}
                  enableTilt={true}
                  className="w-full"
                  onContactClick={() => {
                    // Scroll to contact section or navigate to contact
                    const contactSection = document.querySelector("#contact");
                    if (contactSection) {
                      contactSection.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    } else {
                      // Navigate to homepage contact section
                      window.location.href = "/#contact";
                    }
                  }}
                />
              </div>
            </div>

            {/* Founder Bio */}
            <div className="order-1 md:order-2">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                Ishan Parihar
              </h3>
              <div className="space-y-4">
                <p className="font-sans text-base leading-relaxed text-muted-foreground">
                  Ishan Parihar is a consciousness researcher, spiritual guide,
                  and cultural bridge-builder who has dedicated his life to
                  synthesizing ancient wisdom with modern developmental
                  psychology. His work focuses on creating practical frameworks
                  for conscious evolution in the contemporary Indian context.
                </p>
                <p className="font-sans text-base leading-relaxed text-muted-foreground">
                  Drawing from extensive study of Integral Theory, the Law of
                  One, and traditional Indian philosophical systems, Ishan has
                  developed a unique approach to personal transformation that
                  honors both material achievement and spiritual depth. His
                  journey from personal struggle to conscious leadership informs
                  his compassionate and practical approach to guiding others.
                </p>
                <p className="font-sans text-base leading-relaxed text-muted-foreground">
                  Through his platform, Ishan serves as a catalyst for
                  individuals seeking to transcend fragmented perspectives and
                  embrace integrated living—where success encompasses not just
                  external accomplishments, but the cultivation of
                  consciousness, authentic relationships, and meaningful
                  contribution to collective evolution.
                </p>
              </div>
              <div className="mt-8">
                <Button className="bg-gradient-to-r from-accent-consciousness to-accent-quantum text-white hover:opacity-90 transition-opacity">
                  Connect with Ishan
                </Button>
              </div>
            </div>
          </StaggeredList>
        </div>
      </section>

      {/* Journey Timeline Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              The Journey of Conscious Evolution
            </h2>
            <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From personal awakening to global platform - the milestones that
              shaped this transformative framework.
            </p>
            <div className="mt-8 h-1 w-24 bg-gradient-to-r from-accent-consciousness to-accent-quantum mx-auto rounded-full"></div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <Timeline data={timelineData} />
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
