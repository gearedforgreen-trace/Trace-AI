import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import SiteBrandCentered from "@/components/site-brand-centerd";
import { 
  Shield, 
  UserCheck, 
  Settings, 
  Award, 
  Database, 
  Copyright, 
  XCircle, 
  AlertTriangle, 
  Scale, 
  Gavel, 
  RefreshCw, 
  Mail, 
  MapPin,
  CheckCircle,
  XOctagon,
} from "lucide-react";
import Link from "next/link";

export default function Terms() {
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
            Trace AI – Terms of Service
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
                <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-base sm:text-lg text-green-700 dark:text-green-300 leading-relaxed mb-4">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Trace AI mobile application (&quot;App&quot;), 
              website, and related services (collectively, the &quot;Services&quot;), operated by Geared for GREEN Data Technology, 
              LLC d/b/a Trace AI (&quot;Trace AI,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <div className="bg-green-100 dark:bg-green-950/40 border-l-4 border-green-500 dark:border-green-400 p-3 sm:p-4 rounded-r-lg">
              <p className="text-sm sm:text-base text-green-800 dark:text-green-200">
                <strong>By accessing or using the Services, you agree to be bound by these Terms. 
                If you do not agree, do not use the Services.</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-6">
          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                1. Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 13 years old to use the Services. If you are between 13 and 18 years old, 
                you must have the consent of a parent or legal guardian. By using the Services, you represent 
                and warrant that you meet these requirements.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                2. Account Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To use certain features, you must create an account by providing a valid email address 
                and other requested information. You agree to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Provide accurate and complete information.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Maintain the security of your account credentials.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Notify us promptly of any unauthorized access or security breaches.
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>You are responsible for all activity under your account.</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                3. Use of the Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree to use the Services only for lawful purposes and in compliance with these Terms 
                and applicable laws. You may not:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start">
                  <XCircle className="w-4 h-4 text-red-500 mt-1 mr-3 flex-shrink-0" />
                  Use the Services in a way that could damage, disable, or impair our systems.
                </li>
                <li className="flex items-start">
                  <XCircle className="w-4 h-4 text-red-500 mt-1 mr-3 flex-shrink-0" />
                  Attempt to gain unauthorized access to the Services or related systems.
                </li>
                <li className="flex items-start">
                  <XCircle className="w-4 h-4 text-red-500 mt-1 mr-3 flex-shrink-0" />
                  Falsify, manipulate, or submit fraudulent recycling activity to earn rewards.
                </li>
              </ul>
              
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Fraudulent Activity Includes:
                </h4>
                <ul className="space-y-1 text-red-700 dark:text-red-400 text-sm">
                  <li className="flex items-start gap-2">
                    <XOctagon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    Scanning or photographing non-recyclable items as recyclable
                  </li>
                  <li className="flex items-start gap-2">
                    <XOctagon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    Submitting duplicate or altered photos
                  </li>
                  <li className="flex items-start gap-2">
                    <XOctagon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    Attempting to game the system using multiple accounts or devices
                  </li>
                </ul>
              </div>
              
              <p className="text-muted-foreground mt-4">
                <strong>We reserve the right to suspend or terminate accounts engaged in fraudulent or abusive 
                activity and to revoke any rewards earned through such activity.</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                4. Rewards Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Trace AI may offer rewards for recycling activities recorded through the Services. 
                Rewards are subject to availability, expiration dates, and additional terms provided 
                at the time of issuance. We may modify, suspend, or terminate the rewards program 
                at any time without liability.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                5. Data Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Our Services rely on the accuracy of the recycling activity you submit. Submitting 
                false or misleading data is prohibited and may result in account termination and 
                forfeiture of rewards.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Copyright className="h-4 w-4 sm:h-5 sm:w-5" />
                6. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                All content, trademarks, and other intellectual property rights in the Services are 
                owned by Trace AI or its licensors. You are granted a limited, non-exclusive, 
                non-transferable license to use the Services for personal, non-commercial purposes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                7. Termination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate your access to the Services at any time, with or without 
                cause or notice. Upon termination, your right to use the Services will immediately cease.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                8. Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                The Services are provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, 
                whether express or implied, including but not limited to implied warranties of 
                merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                9. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, Trace AI shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                10. Indemnification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless Trace AI, its affiliates, officers, employees, 
                and agents from any claims, liabilities, damages, losses, and expenses arising out of 
                your use of the Services or violation of these Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
                11. Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of the State of Florida, without regard to 
                conflict of laws principles.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Gavel className="h-4 w-4 sm:h-5 sm:w-5" />
                12. Dispute Resolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Any dispute arising under these Terms shall be resolved through binding arbitration 
                in Miami-Dade County, Florida, except for claims that may be brought in small claims court.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 sm:border sm:border-slate-200 sm:dark:border-green-800/80">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                13. Changes to the Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these Terms at any time. Updated Terms will be posted in the App and 
                on our website, with the &quot;Effective Date&quot; updated accordingly. Continued use constitutes acceptance.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-slate-200 dark:border-green-800/80 bg-slate-50/50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="text-slate-700 dark:text-green-300 flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                14. Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-slate-800 dark:text-green-200">Trace AI Legal Department</p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-600 dark:text-green-400" />
                  <strong>Email:</strong> <a href="mailto:legal@gearedforgreen.com" className="text-green-600 dark:text-green-400 hover:underline">legal@gearedforgreen.com</a>
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
