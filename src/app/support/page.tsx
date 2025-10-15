"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import SiteBrandCentered from "@/components/site-brand-centerd";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Mail,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Shield,
  Trash2,
  FileText,
  Book,
  AlertCircle,
  CheckCircle,
  Recycle,
  Gift,
  Lock,
  Users,
  Settings,
  LifeBuoy,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
  category: string;
  icon: React.ReactNode;
}

export default function SupportPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string): void => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const faqItems: FAQItem[] = [
    // Account Management
    {
      category: "Account Management",
      question: "How do I create an account?",
      answer:
        "To create an account, download the Trace AI app and tap 'Sign Up'. Enter your email address, create a secure password, and follow the verification steps. You can also sign up through our website at the sign-up page.",
      icon: <Users className="w-5 h-5" />,
    },
    {
      category: "Account Management",
      question: "I forgot my password. How do I reset it?",
      answer:
        'Tap "Forgot Password" on the sign-in page, enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.',
      icon: <Lock className="w-5 h-5" />,
    },
    {
      category: "Account Management",
      question: "How do I update my profile information?",
      answer:
        "Sign in to your account, navigate to Settings > Profile, and update your name, email, phone number, or address. Remember to save your changes before exiting.",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      category: "Account Management",
      question: "How do I delete my account?",
      answer: (
        <div className="space-y-3">
          <p>
            You can permanently delete your account and all associated data at
            any time. Here&apos;s how:
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Important: This action cannot be undone
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Deleting your account will permanently remove all your data,
              including recycling history, points, rewards, and account
              information.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">In-App Account Deletion:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open the Trace AI app and sign in</li>
              <li>Navigate to Settings &gt; Account</li>
              <li>Scroll down and tap &quot;Delete My Account&quot;</li>
              <li>
                Read the warning carefully and confirm your decision
              </li>
              <li>
                Enter your password to verify and complete the deletion
              </li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Alternative Method - Email Request:</p>
            <p className="text-sm">
              Email{" "}
              <a
                href="mailto:jimmyh@gearedforgreen.com?subject=Account Deletion Request"
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                jimmyh@gearedforgreen.com
              </a>{" "}
              with the subject &quot;Account Deletion Request&quot; and include
              your registered email address. We will process your request within
              48 hours.
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
              What gets deleted:
            </h4>
            <ul className="space-y-1 text-sm text-red-700 dark:text-red-400">
              <li className="flex items-center gap-2">
                <Trash2 className="w-3 h-3" /> Your account and profile
                information
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-3 h-3" /> All recycling activity history
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-3 h-3" /> Accumulated points balance
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-3 h-3" /> Redeemed and active rewards
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-3 h-3" /> Organization memberships
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-3 h-3" /> All saved preferences and
                settings
              </li>
            </ul>
          </div>
        </div>
      ),
      icon: <Trash2 className="w-5 h-5" />,
    },

    // Recycling Activities
    {
      category: "Recycling Activities",
      question: "How do I record my recycling activity?",
      answer:
        "Open the app, tap the 'Recycle' button, scan the QR code on the recycling bin, take a photo of your recyclable items, and submit. You'll earn points instantly for verified recycling activities.",
      icon: <Recycle className="w-5 h-5" />,
    },
    {
      category: "Recycling Activities",
      question: "What types of materials can I recycle?",
      answer:
        "You can recycle paper, cardboard, plastic bottles, aluminum cans, glass bottles, and other materials accepted by participating recycling locations. Check the material categories in the app for specific details.",
      icon: <Recycle className="w-5 h-5" />,
    },
    {
      category: "Recycling Activities",
      question: "Why wasn't my recycling activity approved?",
      answer:
        "Recycling submissions may be rejected if the photo is unclear, the items are not recyclable, or the submission appears to be fraudulent. Make sure to take clear photos of genuinely recyclable materials at designated locations.",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      category: "Recycling Activities",
      question: "Can I view my recycling history?",
      answer:
        'Yes! Navigate to the "History" or "My Activity" section in the app to view all your past recycling activities, including dates, locations, materials recycled, and points earned.',
      icon: <Book className="w-5 h-5" />,
    },

    // Rewards and Points
    {
      category: "Rewards & Points",
      question: "How do I earn points?",
      answer:
        "Earn points by recording recycling activities through the app. Different materials may have different point values. The more you recycle, the more points you accumulate.",
      icon: <Gift className="w-5 h-5" />,
    },
    {
      category: "Rewards & Points",
      question: "How do I redeem my points for rewards?",
      answer:
        'Browse available coupons and rewards in the "Rewards" section. Tap on a reward you want, confirm the redemption using your points, and you\'ll receive a coupon code or instructions on how to claim your reward.',
      icon: <Gift className="w-5 h-5" />,
    },
    {
      category: "Rewards & Points",
      question: "Do my points expire?",
      answer:
        "Point expiration policies vary by program. Check the terms of your specific rewards program for details. Generally, points remain active as long as your account is active and you continue participating.",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      category: "Rewards & Points",
      question: "Can I transfer points to another user?",
      answer:
        "Currently, points are non-transferable and tied to your individual account. This helps us maintain the integrity of our rewards program and ensure fair distribution.",
      icon: <Users className="w-5 h-5" />,
    },

    // Technical Issues
    {
      category: "Technical Issues",
      question: "The app won't let me sign in. What should I do?",
      answer:
        "First, verify you're using the correct email and password. Try resetting your password if needed. Make sure you have a stable internet connection. If the problem persists, try uninstalling and reinstalling the app, or contact our support team.",
      icon: <Lock className="w-5 h-5" />,
    },
    {
      category: "Technical Issues",
      question: "The QR code scanner isn't working. How do I fix this?",
      answer:
        "Ensure you've granted camera permissions to the app in your device settings. Clean your camera lens, ensure good lighting, and hold your device steady while scanning. If issues persist, update the app to the latest version.",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      category: "Technical Issues",
      question: "I'm not receiving email notifications. What should I check?",
      answer:
        "Check your spam/junk folder for our emails. Add jimmyh@gearedforgreen.com and noreply@gearedforgreen.com to your email contacts. Verify your email address is correct in your account settings and that notification preferences are enabled.",
      icon: <Mail className="w-5 h-5" />,
    },

    // Privacy and Data
    {
      category: "Privacy & Data",
      question: "How is my personal information protected?",
      answer: (
        <div className="space-y-2">
          <p>
            We take your privacy seriously and implement industry-standard
            security measures to protect your data, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Encrypted data transmission and storage</li>
            <li>Secure authentication protocols</li>
            <li>Regular security audits and updates</li>
            <li>Limited access to personal information</li>
            <li>Compliance with data protection regulations</li>
          </ul>
          <p className="text-sm">
            Read our full{" "}
            <Link
              href="/privacy-policy"
              className="text-green-600 dark:text-green-400 hover:underline font-semibold"
            >
              Privacy Policy
            </Link>{" "}
            for detailed information.
          </p>
        </div>
      ),
      icon: <Shield className="w-5 h-5" />,
    },
    {
      category: "Privacy & Data",
      question: "What data does Trace AI collect?",
      answer:
        "We collect information you provide (email, name, location data from recycling activities), usage data (app interactions, recycling patterns), and device information (for app functionality). All data collection is disclosed in our Privacy Policy and used only for providing and improving our services.",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      category: "Privacy & Data",
      question: "Can I request a copy of my data?",
      answer: (
        <div className="space-y-2">
          <p>
            Yes! You have the right to access your personal data. To request a
            copy:
          </p>
          <p className="text-sm">
            Email{" "}
            <a
              href="mailto:jimmyh@gearedforgreen.com?subject=Data Access Request"
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              jimmyh@gearedforgreen.com
            </a>{" "}
            with the subject &quot;Data Access Request&quot; and include your
            registered email address. We will provide your data within 30 days
            in a portable format.
          </p>
        </div>
      ),
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const categories = Array.from(
    new Set(faqItems.map((item) => item.category))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 dark:from-background dark:to-muted">
      {/* Mode Toggle */}
      <div className="absolute right-0 flex h-[60px] w-full items-center justify-end sm:fixed z-10">
        <div className="mt-6 pr-4">
          <ModeToggle />
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 max-w-5xl pt-8 sm:pt-10 pb-12">
        {/* Brand Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex justify-center">
            <SiteBrandCentered />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/50 dark:to-teal-900/50 rounded-full">
              <LifeBuoy className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Trace AI Support Center
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions, get help with your account, or
            contact our support team
          </p>
        </div>

        {/* Quick Contact Section */}
        <Card className="mb-8 border-0 sm:border sm:border-green-300 sm:dark:border-green-600/80 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 shadow-lg">
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
              Need Immediate Help?
            </CardTitle>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              Our support team is here to assist you
            </p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Button
                asChild
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              >
                <a href="mailto:jimmyh@gearedforgreen.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/20"
              >
                <a href="mailto:jimmyh@gearedforgreen.com?subject=Feedback">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Feedback
                </a>
              </Button>
            </div>
            <div className="mt-6 p-4 bg-white/50 dark:bg-black/20 rounded-lg space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:jimmyh@gearedforgreen.com"
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  jimmyh@gearedforgreen.com
                </a>
              </p>
              <p className="text-sm text-center text-muted-foreground">
                <strong>Phone:</strong>{" "}
                <a
                  href="tel:+17862391776"
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  786-239-1776
                </a>
              </p>
              <p className="text-sm text-center text-muted-foreground">
                <strong>Response Time:</strong> Within 24-48 hours
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-slate-200 dark:border-green-800/80 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <Link
                href="/privacy-policy"
                className="flex flex-col items-center text-center group"
              >
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400">
                  Privacy Policy
                </h3>
                <p className="text-sm text-muted-foreground">
                  Learn how we protect your data
                </p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-green-800/80 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <Link
                href="/terms"
                className="flex flex-col items-center text-center group"
              >
                <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400">
                  Terms of Service
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review our terms and conditions
                </p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-green-800/80 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400 mb-3" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Permanently remove your account
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-8 border-slate-200 dark:border-green-800/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              <CardTitle className="text-xl sm:text-2xl text-slate-800 dark:text-green-200">
                Frequently Asked Questions
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Find answers to the most common questions about Trace AI
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category} className="space-y-3">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  >
                    {category}
                  </Badge>
                  <div className="space-y-2">
                    {faqItems
                      .filter((item) => item.category === category)
                      .map((item, index) => {
                        const itemId = `${category}-${index}`;
                        const isOpen = openItems.includes(itemId);

                        return (
                          <Collapsible
                            key={itemId}
                            open={isOpen}
                            onOpenChange={() => toggleItem(itemId)}
                          >
                            <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
                              <CollapsibleTrigger className="w-full">
                                <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors py-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 text-left">
                                      <div className="text-green-600 dark:text-green-400 flex-shrink-0">
                                        {item.icon}
                                      </div>
                                      <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                                        {item.question}
                                      </h3>
                                    </div>
                                    <ChevronDown
                                      className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${
                                        isOpen ? "transform rotate-180" : ""
                                      }`}
                                    />
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="pt-0 pb-4 px-6">
                                  <div className="pl-8 text-sm text-muted-foreground leading-relaxed">
                                    {item.answer}
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card className="mb-8 border-slate-200 dark:border-green-800/80 bg-slate-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2">
              <Book className="w-5 h-5" />
              Additional Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="mailto:jimmyh@gearedforgreen.com?subject=Privacy Rights Request"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white dark:hover:bg-slate-900/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Exercise Your Privacy Rights
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Request data access, deletion, or opt-out
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
              </a>

              <a
                href="mailto:jimmyh@gearedforgreen.com?subject=Report a Problem"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white dark:hover:bg-slate-900/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Report a Technical Issue
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Let us know about bugs or problems
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
              </a>

              <a
                href="mailto:jimmyh@gearedforgreen.com?subject=Feature Request"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white dark:hover:bg-slate-900/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Request a Feature
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Share ideas to improve Trace AI
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-slate-200 dark:border-green-800/80">
          <CardHeader>
            <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-800 dark:text-green-200 mb-2">
                  Geared for GREEN Data Technology, LLC d/b/a Trace AI
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-600 dark:text-green-400" />
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:jimmyh@gearedforgreen.com"
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      jimmyh@gearedforgreen.com
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-600 dark:text-green-400" />
                    <strong>Phone:</strong>{" "}
                    <a
                      href="tel:+17862391776"
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      786-239-1776
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600 dark:text-green-400" />
                    <strong>Address:</strong> 848 Brickell Ave Miami FL 33131
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Our Commitment
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  We strive to respond to all support inquiries within 24-48
                  hours during business days. For urgent matters, please
                  indicate &quot;URGENT&quot; in your email subject line.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-sm text-muted-foreground mb-4">
            Still have questions? We&apos;re here to help!
          </p>
          <Button
            asChild
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/20"
          >
            <a href="mailto:jimmyh@gearedforgreen.com">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-8">
            © 2025 Trace AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
