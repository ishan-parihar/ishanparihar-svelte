import { Metadata } from "next";
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Heart,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ContactInfoClient } from "@/components/contact/contact-info-client";

export const metadata: Metadata = {
  title: "Contact Us | Ishan Parihar",
  description:
    "Get in touch with Ishan Parihar for spiritual guidance, coaching sessions, and support. We're here to help you on your consciousness journey.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4" />
              Get In Touch
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground mb-6">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ready to begin your transformative journey? We're here to guide
              and support you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Email Contact */}
              <div className="bg-card border border-border rounded-none p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-accent/10 rounded-none group-hover:bg-accent/20 transition-colors">
                    <Mail className="w-8 h-8 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-subheadings text-foreground">
                      Email Support
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      For general inquiries, product support, and collaboration
                      opportunities.
                    </p>
                    <Link
                      href="mailto:ishan.parihar.official@gmail.com"
                      className="text-accent hover:text-accent/80 font-medium transition-colors text-sm block break-all"
                    >
                      ishan.parihar.official@gmail.com
                    </Link>
                  </div>
                </div>
              </div>

              {/* Phone Contact */}
              <div className="bg-card border border-border rounded-none p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-accent/10 rounded-none group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-8 h-8 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-subheadings text-foreground">
                      Phone Support
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      For urgent matters and direct consultation scheduling.
                    </p>
                    <Link
                      href="tel:+919205112559"
                      className="text-accent hover:text-accent/80 font-medium transition-colors text-sm"
                    >
                      +91 9205112559
                    </Link>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-card border border-border rounded-none p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-accent/10 rounded-none group-hover:bg-accent/20 transition-colors">
                    <Clock className="w-8 h-8 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-subheadings text-foreground">
                      Response Time
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We typically respond to all inquiries within 24-48 hours.
                    </p>
                    <span className="text-accent font-medium text-sm">
                      24-48 Hours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* What We Can Help With */}
            <div className="bg-gradient-to-br from-accent/5 via-background to-accent/5 rounded-none p-8 lg:p-12 mb-0">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                  <Heart className="w-4 h-4" />
                  How We Can Help
                </div>
                <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">
                  What We Can Assist You With
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Whether you're just beginning your spiritual journey or
                  seeking deeper insights, we're here to support you.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-accent/10 rounded-none mt-1">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-subheadings text-foreground mb-2">
                        Digital Product Support
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Technical assistance with course access, downloads, and
                        platform navigation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-accent/10 rounded-none mt-1">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-subheadings text-foreground mb-2">
                        Spiritual Guidance
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Personal questions about consciousness, meditation
                        practices, and spiritual growth.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-accent/10 rounded-none mt-1">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-subheadings text-foreground mb-2">
                        Coaching Sessions
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Scheduling one-on-one sessions and group workshops for
                        deeper transformation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-accent/10 rounded-none mt-1">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-subheadings text-foreground mb-2">
                        Course Recommendations
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Personalized suggestions for courses and materials based
                        on your spiritual journey.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-accent/10 rounded-none mt-1">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-subheadings text-foreground mb-2">
                        Community Support
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Connecting with like-minded individuals and joining our
                        conscious community.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-accent/10 rounded-none mt-1">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-subheadings text-foreground mb-2">
                        Partnership Opportunities
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Collaboration inquiries for workshops, speaking
                        engagements, and joint ventures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Contact Form Section */}
      <div className="my-0 [&>section]:py-0 [&>section]:md:py-10">
        <ContactInfoClient />
      </div>

      {/* Resume container for remaining content */}
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Contact Form Alternative */}
            <div className="bg-card border border-border rounded-none p-8 lg:p-12 text-center">
              <h3 className="text-2xl font-subheadings text-foreground mb-4">
                Ready to Connect?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Choose the method that feels most comfortable for you. Whether
                it's a quick email or a phone conversation, we're committed to
                providing you with the support and guidance you need on your
                transformative journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="mailto:ishan.parihar.official@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-none hover:bg-accent/90 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </Link>
                <Link
                  href="tel:+919205112559"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-background rounded-none hover:bg-accent/5 transition-colors font-medium text-foreground"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
