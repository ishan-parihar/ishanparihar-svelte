import { Metadata } from "next";
import { Crown, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Premium Membership - Unlock Exclusive Content",
  description:
    "Get access to premium articles, in-depth tutorials, and exclusive resources with our premium membership.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-900 dark:text-yellow-100">
              Premium Membership
            </h1>
          </div>
          <p className="text-xl text-yellow-700 dark:text-yellow-300 max-w-2xl mx-auto">
            Unlock exclusive content, in-depth tutorials, and premium resources.
            Join thousands of members who are already enjoying premium content.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="relative border-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">
                $0<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Access to free articles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Community comments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Basic tutorials</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signin">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-yellow-400 dark:border-yellow-600 shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Star className="h-3 w-3" />
                Most Popular
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-900 dark:text-yellow-100">
                Premium
              </CardTitle>
              <CardDescription>
                Everything you need for advanced learning
              </CardDescription>
              <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                $9.99<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>All free features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Access to premium articles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>In-depth tutorials</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Exclusive resources</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button
                asChild
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Link href="/auth/signin">Upgrade to Premium</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For professionals and teams</CardDescription>
              <div className="text-3xl font-bold">
                $19.99<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>All premium features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Advanced tutorials</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>1-on-1 consultations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Custom resources</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Team collaboration</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signin">Contact Sales</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8 text-yellow-900 dark:text-yellow-100">
            Why Choose Premium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Content</h3>
              <p className="text-muted-foreground">
                Access premium articles and tutorials not available anywhere
                else.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">
                In-depth, well-researched content created by industry experts.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Priority Support</h3>
              <p className="text-muted-foreground">
                Get help when you need it with our priority support system.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 rounded-none p-8 border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-2xl font-bold mb-4 text-yellow-900 dark:text-yellow-100">
            Ready to unlock premium content?
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-6 max-w-2xl mx-auto">
            Join thousands of members who are already enjoying exclusive content
            and advanced tutorials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Link href="/auth/signin">Start Your Premium Journey</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-950"
            >
              <Link href="/blog">Browse Free Articles</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
