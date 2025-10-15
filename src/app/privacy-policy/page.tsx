import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import SiteBrandCentered from "@/components/site-brand-centerd";
import { 
  Shield, 
  UserCheck, 
  Settings, 
  Database, 
  XCircle, 
  RefreshCw, 
  Mail, 
  MapPin,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 dark:from-background dark:to-muted">
      {/* Mode Toggle */}
      <div className="absolute right-0 flex h-[60px] w-full items-center justify-end sm:fixed z-10">
        <div className="mt-6 pr-4">
          <ModeToggle />
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 max-w-4xl pt-8 sm:pt-10 pb-12">
        {/* Brand Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex justify-center">
            <SiteBrandCentered />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
         
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Trace AI – Privacy Policy
          </h1>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="w-4 h-4 mr-2" />
            Effective Date: August 1, 2025
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-6 sm:mb-8 border-0 sm:border sm:border-green-300 sm:dark:border-green-600/80 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 shadow-lg">
          <CardHeader className="text-center px-4 sm:px-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
              Your Privacy Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-base sm:text-lg text-green-700 dark:text-green-300 leading-relaxed mb-4">
              Geared for GREEN Data Technology, LLC d/b/a Trace AI (&quot;Trace AI,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              This Privacy Policy explains how we collect, use, share, and protect your personal information with transparency and care.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-6">
          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">We collect:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Personal Information:</strong>
                    <span className="ml-2">Email address, account details.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Recycling Activity Data:</strong>
                    <span className="ml-2">Location (where), date/time (when), type of materials recycled (what).</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Device Information:</strong>
                    <span className="ml-2">IP address, device type, operating system, app usage patterns.</span>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">We use your information to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Operate and improve the Services.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Track recycling activity and issue rewards.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Communicate with you about your account, rewards, and updates.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Prevent fraud and misuse.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Comply with legal obligations.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                3. Sharing Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">We may share your information with:</p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Reward Partners:</strong>
                    <span className="ml-2">To verify recycling activity and deliver coupons or rewards.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Service Providers:</strong>
                    <span className="ml-2">For analytics, hosting, and operational support.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Legal Authorities:</strong>
                    <span className="ml-2">When required by law or to protect our rights.</span>
                  </div>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information for monetary value. However, we may &quot;share&quot; personal information with partners in ways defined as &quot;selling&quot; or &quot;sharing&quot; under certain state privacy laws.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                4. Your Rights (CCPA & GDPR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Request access to the personal information we hold about you.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Request correction or deletion of your personal information.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Opt-out of the &quot;sale&quot; or &quot;sharing&quot; of personal information.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Object to or limit certain data processing.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Request a portable copy of your personal information.
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights, email us at <a href="mailto:jimmyh@gearedforgreen.com?subject=Privacy Rights Request" className="text-green-600 dark:text-green-400 hover:underline font-semibold">jimmyh@gearedforgreen.com</a> with the subject line &quot;Privacy Rights Request.&quot; We will verify your identity before fulfilling requests.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                5. Do Not Sell or Share My Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you do not want us to share your personal information with partners for targeted rewards, you can opt-out by:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Emailing <a href="mailto:jimmyh@gearedforgreen.com?subject=Do Not Sell or Share My Personal Information" className="text-green-600 dark:text-green-400 hover:underline font-semibold">jimmyh@gearedforgreen.com</a> with the subject &quot;Do Not Sell or Share My Personal Information,&quot; or</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Adjusting your privacy settings in the App.</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Opting out may limit your ability to receive certain rewards.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                6. Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We keep your information as long as needed to provide Services, comply with laws, resolve disputes, and enforce agreements.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                7. Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We use reasonable safeguards to protect your personal information, but no system is completely secure.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                8. Children&apos;s Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Our Services are not directed to children under 13. If we learn we have collected personal information from a child under 13 without parental consent, we will delete it.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                9. Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. The updated version will be posted in the App and on our website, with a new &quot;Effective Date.&quot;
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-slate-200 dark:border-green-800/80 bg-slate-50/50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                10. Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-slate-800 dark:text-green-200">Trace AI Privacy Officer</p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-600 dark:text-green-400" />
                  <strong>Email:</strong> <a href="mailto:jimmyh@gearedforgreen.com" className="text-green-600 dark:text-green-400 hover:underline">jimmyh@gearedforgreen.com</a>
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-600 dark:text-green-400" />
                  <strong>Address:</strong> 848 Brickell Ave Miami FL 33131
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-sm text-muted-foreground">
            Last updated: August 1, 2025 | © 2025 Trace AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
