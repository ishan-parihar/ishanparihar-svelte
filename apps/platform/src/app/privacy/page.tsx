import { Metadata } from "next";
import { Shield, Eye, Lock, Database, Cookie, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Ishan Parihar",
  description:
    "Privacy Policy for Ishan Parihar's digital products and services. Learn how we protect and handle your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Privacy & Security
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your privacy is important to us. Learn how we collect, use, and
              protect your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <div className="bg-card border border-border rounded-none p-8 mb-12">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-accent/10 rounded-none">
                    <Lock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-subheadings text-foreground mb-2">
                      Our Commitment to Privacy
                    </h2>
                    <p className="text-muted-foreground">
                      This privacy policy sets out how{" "}
                      <strong>ISHAN PARIHAR</strong> uses and protects any
                      information that you give when you visit our website
                      and/or agree to purchase from us. We are committed to
                      ensuring that your privacy is protected.
                    </p>
                  </div>
                </div>
              </div>

              {/* Information We Collect */}
              <div className="space-y-12">
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                    <Database className="w-5 h-5 text-accent" />
                    Information We Collect
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>We may collect the following information:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Personal Information:</strong> Name and contact
                        information including email address
                      </li>
                      <li>
                        <strong>Account Details:</strong> Username, password,
                        and profile information
                      </li>
                      <li>
                        <strong>Payment Information:</strong> Billing details
                        for digital product purchases (processed securely
                        through third-party payment processors)
                      </li>
                      <li>
                        <strong>Demographic Information:</strong> Location,
                        postcode, preferences and interests, if required
                      </li>
                      <li>
                        <strong>Usage Data:</strong> Information about how you
                        use our website and digital products
                      </li>
                      <li>
                        <strong>Communication Data:</strong> Records of
                        correspondence and support interactions
                      </li>
                      <li>
                        <strong>Survey Data:</strong> Information relevant to
                        customer surveys and/or offers
                      </li>
                      <li>
                        <strong>Preferences:</strong> Your interests,
                        preferences, and feedback
                      </li>
                      <li>
                        <strong>Technical Data:</strong> IP address, browser
                        type, device information, and access logs
                      </li>
                    </ul>
                  </div>
                </div>

                {/* How We Use Information */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                    <Eye className="w-5 h-5 text-accent" />
                    How We Use Your Information
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We require this information to understand your needs and
                      provide you with better service, and in particular for the
                      following reasons:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Service Delivery:</strong> To provide access to
                        purchased digital products and services
                      </li>
                      <li>
                        <strong>Account Management:</strong> To create and
                        maintain your user account
                      </li>
                      <li>
                        <strong>Customer Support:</strong> To respond to your
                        inquiries and provide technical support
                      </li>
                      <li>
                        <strong>Internal Record Keeping:</strong> For business
                        operations and compliance
                      </li>
                      <li>
                        <strong>Product Improvement:</strong> To enhance our
                        digital products and user experience
                      </li>
                      <li>
                        <strong>Communication:</strong> To send important
                        updates about your purchases and account
                      </li>
                      <li>
                        <strong>Marketing:</strong> To send promotional emails
                        about new products and special offers (with your
                        consent)
                      </li>
                      <li>
                        <strong>Research:</strong> For market research purposes
                        to better understand our users' needs
                      </li>
                      <li>
                        <strong>Communication:</strong> We may contact you by
                        email, phone, or mail for various purposes
                      </li>
                      <li>
                        <strong>Personalization:</strong> To customize the
                        website according to your interests and preferences
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Data Security */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-accent" />
                    Data Security and Protection
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We are committed to ensuring that your information is
                      secure. In order to prevent unauthorized access or
                      disclosure, we have put in place suitable physical,
                      electronic, and managerial procedures to safeguard and
                      secure the information we collect online.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>SSL encryption for all data transmission</li>
                      <li>
                        Secure payment processing through trusted third-party
                        providers
                      </li>
                      <li>Regular security audits and updates</li>
                      <li>Access controls and authentication measures</li>
                      <li>Data backup and recovery procedures</li>
                    </ul>
                  </div>
                </div>

                {/* Cookies */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                    <Cookie className="w-5 h-5 text-accent" />
                    How We Use Cookies
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      A cookie is a small file which asks permission to be
                      placed on your computer's hard drive. Once you agree, the
                      file is added and the cookie helps analyze web traffic or
                      lets you know when you visit a particular site.
                    </p>
                    <p>
                      Cookies allow web applications to respond to you as an
                      individual. The web application can tailor its operations
                      to your needs, likes and dislikes by gathering and
                      remembering information about your preferences.
                    </p>
                    <p>
                      We use traffic log cookies to identify which pages are
                      being used. This helps us analyze data about webpage
                      traffic and improve our website in order to tailor it to
                      customer needs. We only use this information for
                      statistical analysis purposes and then the data is removed
                      from the system.
                    </p>
                    <p>
                      Overall, cookies help us provide you with a better
                      website, by enabling us to monitor which pages you find
                      useful and which you do not. A cookie in no way gives us
                      access to your computer or any information about you,
                      other than the data you choose to share with us.
                    </p>
                    <p>
                      You can choose to accept or decline cookies. Most web
                      browsers automatically accept cookies, but you can usually
                      modify your browser setting to decline cookies if you
                      prefer. This may prevent you from taking full advantage of
                      the website.
                    </p>
                  </div>
                </div>

                {/* Third Party Sharing */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4">
                    Third Party Information Sharing
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We will not sell, distribute or lease your personal
                      information to third parties unless we have your
                      permission or are required by law to do so.
                    </p>
                    <p>
                      We may use your personal information to send you
                      promotional information about third parties which we think
                      you may find interesting if you tell us that you wish this
                      to happen.
                    </p>
                    <p>
                      We work with trusted third-party service providers for:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        Payment processing (all payment data is handled securely
                        by certified payment processors)
                      </li>
                      <li>Email delivery services</li>
                      <li>Website analytics and performance monitoring</li>
                      <li>Customer support tools</li>
                    </ul>
                  </div>
                </div>

                {/* Your Rights */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-accent" />
                    Controlling Your Personal Information
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      You may choose to restrict the collection or use of your
                      personal information in the following ways:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        Whenever you are asked to fill in a form on the website,
                        look for the box that you can click to indicate that you
                        do not want the information to be used by anybody for
                        direct marketing purposes
                      </li>
                      <li>
                        If you have previously agreed to us using your personal
                        information for direct marketing purposes, you may
                        change your mind at any time by writing to or emailing
                        us at ishan.parihar.official@gmail.com
                      </li>
                      <li>
                        You have the right to request access to the personal
                        information we hold about you
                      </li>
                      <li>
                        You can request correction of any inaccurate or
                        incomplete information
                      </li>
                      <li>
                        You may request deletion of your personal data (subject
                        to legal requirements)
                      </li>
                    </ul>
                    <p>
                      If you believe that any information we are holding on you
                      is incorrect or incomplete, please contact us as soon as
                      possible. We will promptly correct any information found
                      to be incorrect.
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-accent/5 border border-accent/20 rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4">
                    Contact Us About Privacy
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      If you have any questions about this Privacy Policy or how
                      we handle your personal information, please contact us:
                    </p>
                    <p>
                      <strong>E-Mail:</strong> ishan.parihar.official@gmail.com
                    </p>
                    <p>
                      <strong>Phone:</strong> 9205112559
                    </p>
                  </div>
                </div>

                {/* Policy Updates */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4">
                    Policy Updates
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      ISHAN PARIHAR may change this policy from time to time by
                      updating this page. You should check this page from time
                      to time to ensure that you adhere to these changes.
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
