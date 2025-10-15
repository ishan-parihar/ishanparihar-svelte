import { Metadata } from "next";
import { Sparkles, Shield, FileText, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions | Ishan Parihar",
  description:
    "Terms and Conditions for digital products and services offered by Ishan Parihar. Read our terms of use and service agreements.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Legal Information
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground mb-6">
              Terms and Conditions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully before using our digital
              products and services.
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
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading text-foreground mb-2">
                      Agreement Overview
                    </h2>
                    <p className="text-muted-foreground">
                      For the purpose of these Terms and Conditions, the term
                      "we", "us", "our" used anywhere on this page shall mean{" "}
                      <strong>ISHAN PARIHAR</strong>. "You", "your", "user",
                      "visitor" shall mean any natural or legal person who is
                      visiting our website and/or agreed to purchase from us.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Content */}
              <div className="space-y-12">
                {/* Website Usage */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Website Usage and Content
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Your use of the website and/or purchase from us are
                      governed by the following Terms and Conditions:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        The content of the pages of this website is subject to
                        change without notice.
                      </li>
                      <li>
                        Neither we nor any third parties provide any warranty or
                        guarantee as to the accuracy, timeliness, performance,
                        completeness or suitability of the information and
                        materials found or offered on this website for any
                        particular purpose.
                      </li>
                      <li>
                        You acknowledge that such information and materials may
                        contain inaccuracies or errors and we expressly exclude
                        liability for any such inaccuracies or errors to the
                        fullest extent permitted by law.
                      </li>
                      <li>
                        Your use of any information or materials on our website
                        and/or product pages is entirely at your own risk, for
                        which we shall not be liable.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Digital Products */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent" />
                    Digital Products and Services
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Our website exclusively offers digital products and
                      services including but not limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Digital courses and educational materials</li>
                      <li>E-books and downloadable content</li>
                      <li>Online coaching sessions and consultations</li>
                      <li>Meditation guides and spiritual resources</li>
                      <li>Webinars and virtual workshops</li>
                    </ul>
                    <p>
                      It shall be your own responsibility to ensure that any
                      products, services or information available through our
                      website and/or product pages meet your specific
                      requirements.
                    </p>
                  </div>
                </div>

                {/* Intellectual Property */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-accent" />
                    Intellectual Property Rights
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Our website contains material which is owned by or
                      licensed to us. This material includes, but is not limited
                      to, the design, layout, look, appearance and graphics.
                      Reproduction is prohibited other than in accordance with
                      the copyright notice, which forms part of these terms and
                      conditions.
                    </p>
                    <p>
                      All trademarks reproduced in our website which are not the
                      property of, or licensed to, the operator are acknowledged
                      on the website.
                    </p>
                    <p>
                      Unauthorized use of information provided by us shall give
                      rise to a claim for damages and/or be a criminal offense.
                    </p>
                  </div>
                </div>

                {/* Payment and Transactions */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-accent" />
                    Payment Terms and Transactions
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We shall be under no liability whatsoever in respect of
                      any loss or damage arising directly or indirectly out of
                      the decline of authorization for any transaction, on
                      account of the cardholder having exceeded the preset limit
                      mutually agreed by us with our acquiring bank from time to
                      time.
                    </p>
                    <p>
                      All digital products are delivered electronically upon
                      successful payment confirmation. Access credentials and
                      download links will be provided via email to the address
                      specified during registration.
                    </p>
                  </div>
                </div>

                {/* External Links */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4">
                    External Links and Third Parties
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      From time to time our website may also include links to
                      other websites. These links are provided for your
                      convenience to provide further information.
                    </p>
                    <p>
                      You may not create a link to our website from another
                      website or document without ISHAN PARIHAR's prior written
                      consent.
                    </p>
                  </div>
                </div>

                {/* Governing Law */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4">
                    Governing Law
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Any dispute arising out of use of our website and/or
                      purchase with us and/or any engagement with us is subject
                      to the laws of India.
                    </p>
                  </div>
                </div>

                {/* Cancellation and Refund Policy */}
                <div className="bg-card border border-border rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-accent" />
                    Cancellation and Refund Policy
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      ISHAN PARIHAR believes in helping customers as far as
                      possible, and has therefore a liberal cancellation policy.
                      Under this policy:
                    </p>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">
                        Cancellation Policy:
                      </h4>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>
                          Cancellations will be considered only if the request
                          is made within 6-8 days of placing the order.
                        </li>
                        <li>
                          However, the cancellation request may not be
                          entertained if the digital products have been accessed
                          or downloaded.
                        </li>
                        <li>
                          ISHAN PARIHAR does not accept cancellation requests
                          for live sessions, webinars, or time-sensitive digital
                          content once accessed.
                        </li>
                        <li>
                          For coaching sessions, cancellations must be made at
                          least 24 hours before the scheduled session.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">
                        Refund Policy:
                      </h4>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>
                          Refund/replacement can be made if the customer
                          establishes that the quality of digital product
                          delivered is not as described.
                        </li>
                        <li>
                          In case of receipt of corrupted or defective digital
                          files, please report the same to our Customer Service
                          team within 6-8 days of purchase.
                        </li>
                        <li>
                          In case you feel that the digital product received is
                          not as shown on the site or as per your expectations,
                          you must bring it to the notice of our customer
                          service within 6-8 days of receiving the product.
                        </li>
                        <li>
                          The Customer Service Team after looking into your
                          complaint will take an appropriate decision.
                        </li>
                        <li>
                          For products that come with a satisfaction guarantee,
                          please refer to the specific terms mentioned at the
                          time of purchase.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">
                        Refund Processing:
                      </h4>
                      <p>
                        In case of any refunds approved by ISHAN PARIHAR, it'll
                        take 6-8 business days for the refund to be processed to
                        the end customer.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-accent/5 border border-accent/20 rounded-none p-8">
                  <h3 className="text-xl font-subheadings text-foreground mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      <strong>Merchant Legal Entity Name:</strong> ISHAN PARIHAR
                    </p>
                    <p>
                      <strong>E-Mail ID:</strong>{" "}
                      ishan.parihar.official@gmail.com
                    </p>
                    <p>
                      <strong>Telephone No:</strong> 9205112559
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
