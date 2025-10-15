import { Metadata } from "next";
import { Download, Zap, Shield, Clock, Mail, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Digital Delivery Policy | Ishan Parihar",
  description:
    "Learn about our instant digital product delivery process for courses, e-books, and spiritual resources from Ishan Parihar.",
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Download className="w-4 h-4" />
              Digital Delivery
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground mb-6">
              Digital Delivery Policy
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Instant access to your spiritual growth resources. Learn how we
              deliver our digital products seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Digital Products Overview */}
            <div className="bg-gradient-to-br from-accent/5 via-background to-accent/5 rounded-none p-8 lg:p-12 mb-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                  <Zap className="w-4 h-4" />
                  Instant Access
                </div>
                <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">
                  100% Digital Products
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  All our products are delivered digitally for instant access.
                  No physical shipping required - start your transformation
                  journey immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="p-4 bg-accent/10 rounded-none w-fit mx-auto mb-4">
                    <Download className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-ui font-semibold text-foreground mb-2">
                    Instant Download
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Access your purchases immediately after payment confirmation
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-accent/10 rounded-none w-fit mx-auto mb-4">
                    <Shield className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-ui font-semibold text-foreground mb-2">
                    Secure Delivery
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Protected download links sent directly to your email
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-accent/10 rounded-none w-fit mx-auto mb-4">
                    <Clock className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-subheadings text-foreground mb-2">
                    24/7 Access
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Download and access your content anytime, anywhere
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              {/* Delivery Process */}
              <div className="bg-card border border-border rounded-none p-8">
                <h3 className="text-xl font-subheadings text-foreground mb-6 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  How Digital Delivery Works
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">
                        1
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Complete Your Purchase
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Securely complete your payment through our trusted
                        payment processors.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">
                        2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Instant Confirmation
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Receive immediate payment confirmation and order details
                        via email.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">
                        3
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Access Credentials Delivered
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Get your download links, access credentials, and login
                        information within minutes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">
                        4
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Start Your Journey
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Begin accessing your digital content immediately and
                        start your transformation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Types */}
              <div className="bg-card border border-border rounded-none p-8">
                <h3 className="text-xl font-ui font-semibold text-foreground mb-6 flex items-center gap-3">
                  <Download className="w-5 h-5 text-accent" />
                  Digital Product Types We Deliver
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Online Courses & Workshops
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Access through our learning platform with lifetime
                          availability
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          E-books & Guides
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          PDF downloads available immediately after purchase
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Audio Meditations
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          High-quality MP3 files for download and streaming
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Video Content
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Streaming access and downloadable video files
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Coaching Sessions
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Calendar links and video conference access details
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Digital Resources
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Templates, worksheets, and supplementary materials
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* International and Domestic Delivery */}
              <div className="bg-card border border-border rounded-none p-8">
                <h3 className="text-xl font-subheadings text-foreground mb-6 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent" />
                  International and Domestic Delivery
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <div className="bg-accent/5 border border-accent/20 rounded-none p-6">
                    <h4 className="font-medium text-foreground mb-3">
                      Digital Delivery Worldwide
                    </h4>
                    <p className="mb-4">
                      For both international and domestic buyers, all orders are
                      delivered digitally through secure electronic delivery
                      systems. Unlike traditional physical shipping through
                      courier companies or postal services, our digital products
                      are delivered instantly to your email address.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>International Buyers:</strong> Digital products
                        are delivered instantly worldwide via email, eliminating
                        the need for international courier services
                      </li>
                      <li>
                        <strong>Domestic Buyers:</strong> Same instant digital
                        delivery process applies regardless of location within
                        India
                      </li>
                      <li>
                        <strong>No Physical Shipping:</strong> All products are
                        digital, so there are no courier companies, postal
                        authorities, or physical delivery delays involved
                      </li>
                      <li>
                        <strong>Delivery Confirmation:</strong> Delivery of all
                        digital services will be confirmed on your email ID as
                        specified during registration
                      </li>
                    </ul>
                  </div>

                  <div className="bg-background border border-border rounded-none p-6">
                    <h4 className="font-medium text-foreground mb-3">
                      Important Note
                    </h4>
                    <p>
                      ISHAN PARIHAR guarantees to deliver digital access
                      credentials and download links immediately upon payment
                      confirmation. Unlike physical products, there are no
                      shipping delays, courier dependencies, or postal authority
                      limitations. For any issues in utilizing our digital
                      services, you may contact our helpdesk at 9205112559 or
                      ishan.parihar.official@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Timeframes */}
              <div className="bg-card border border-border rounded-none p-8">
                <h3 className="text-xl font-subheadings text-foreground mb-6 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent" />
                  Delivery Timeframes
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-none">
                    <span className="font-medium text-foreground">
                      Automated Digital Products
                    </span>
                    <span className="text-accent font-semibold">Instant</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-none">
                    <span className="font-medium text-foreground">
                      Course Access & Login Details
                    </span>
                    <span className="text-accent font-semibold">
                      Within 5 minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-none">
                    <span className="font-medium text-foreground">
                      Personal Coaching Sessions
                    </span>
                    <span className="text-accent font-semibold">
                      Within 24 hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-none">
                    <span className="font-medium text-foreground">
                      Custom Digital Resources
                    </span>
                    <span className="text-accent font-semibold">
                      1-3 business days
                    </span>
                  </div>
                </div>
              </div>

              {/* Access & Support */}
              <div className="bg-card border border-border rounded-none p-8">
                <h3 className="text-xl font-subheadings text-foreground mb-6 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-accent" />
                  Access & Technical Support
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">
                      Lifetime Access:
                    </strong>{" "}
                    Most digital products come with lifetime access. You can
                    download and re-access your content anytime.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      Multiple Device Support:
                    </strong>{" "}
                    Access your content on any device - computer, tablet, or
                    smartphone.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      Backup Downloads:
                    </strong>{" "}
                    Lost your files? Contact us for re-download links at no
                    additional cost.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      Technical Issues:
                    </strong>{" "}
                    If you experience any problems accessing your digital
                    products, our support team is available to help within 24
                    hours.
                  </p>
                </div>
              </div>

              {/* Refund Policy for Digital Products */}
              <div className="bg-card border border-border rounded-none p-8">
                <h3 className="text-xl font-subheadings text-foreground mb-6">
                  Digital Product Refund & Cancellation Policy
                </h3>
                <div className="space-y-6 text-muted-foreground">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">
                      Cancellation Guidelines:
                    </h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        Cancellations will be considered only if the request is
                        made within 6-8 days of placing the order
                      </li>
                      <li>
                        Cancellation requests may not be entertained if digital
                        products have been accessed or downloaded
                      </li>
                      <li>
                        Live sessions and time-sensitive content cannot be
                        cancelled once accessed
                      </li>
                      <li>
                        Coaching sessions require 24-hour advance notice for
                        cancellation
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-3">
                      Refund Scenarios:
                    </h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Technical Issues:</strong> Full refund if we
                        cannot resolve access problems within 48 hours
                      </li>
                      <li>
                        <strong>Content Quality:</strong> Refund available
                        within 6-8 days if content doesn't match description
                      </li>
                      <li>
                        <strong>Corrupted Files:</strong> Immediate replacement
                        or refund for defective digital files
                      </li>
                      <li>
                        <strong>Duplicate Purchases:</strong> Full refund for
                        accidental duplicate orders
                      </li>
                      <li>
                        <strong>Satisfaction Guarantee:</strong> Specific
                        guarantee terms as mentioned at purchase
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-3">
                      Refund Process:
                    </h4>
                    <p>
                      In case of any refunds approved by ISHAN PARIHAR, it will
                      take 6-8 business days for the refund to be processed to
                      the end customer. All refund requests must include a
                      detailed explanation of the issue and be submitted within
                      the specified timeframe.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact for Delivery Issues */}
              <div className="bg-accent/5 border border-accent/20 rounded-none p-8">
                <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-accent" />
                  Need Help with Your Digital Delivery?
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you haven't received your digital products within the
                    expected timeframe, or if you're experiencing any access
                    issues, please contact us immediately:
                  </p>
                  <div className="space-y-2">
                    <p>
                      <strong>Email:</strong> ishan.parihar.official@gmail.com
                    </p>
                    <p>
                      <strong>Phone:</strong> 9205112559
                    </p>
                    <p>
                      <strong>Response Time:</strong> Within 24 hours for
                      delivery issues
                    </p>
                  </div>
                  <p className="text-sm">
                    Please include your order number and the email address used
                    for purchase when contacting support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
