"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { FileText } from "lucide-react"

const TermsOfService: React.FC = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white dark:bg-[#15325a]">
          <div className="container mx-auto px-4 py-20">
            <div className="w-96 h-20 bg-gray-300 animate-pulse rounded mx-auto mb-8"></div>
            <div className="w-full h-96 bg-gray-300 animate-pulse rounded"></div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out">
        {/* Header Section */}
        <div
          className="transition-colors duration-200 ease-in-out text-white"
          style={{
            background: "linear-gradient(135deg, #1a4b6b 0%, #15325a 50%, #0d2847 100%)"
          }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
              <div className="space-y-3 md:space-y-4">
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 text-xs md:text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  <span>Legal</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white font-outfit">
                  Terms of Service
                </h1>
                <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
                  Please read these terms carefully before using the inHalt platform
                </p>
                <div className="text-sm text-white/70">
                  Last Updated: October 15, 2025
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-6 md:-mt-8 relative z-10 pb-12 md:pb-16">
          {/* Content Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-200 ease-in-out p-6 md:p-8 lg:p-12">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-outfit">
                inHalt Marketplace Platform
              </h2>

              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">1. AGREEMENT TO TERMS</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (whether as a Business or College Society, collectively &quot;User&quot; or &quot;you&quot;) and inHalt (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), concerning your access to and use of the inHalt marketplace platform available at [website URL] and any related mobile applications (collectively, the &quot;Platform&quot;).
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must immediately discontinue use of the Platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">2. DEFINITIONS</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>&quot;Business&quot; refers to any company, organisation, startup, or SME seeking consulting services through the Platform.</li>
                    <li>The &quot;College Society&quot; refers to registered student organisations, consulting clubs, or academic groups that offer consulting services through the Platform.</li>
                    <li>&quot;Services&quot; refers to the marketplace platform services that connect Businesses with College Societies for consulting projects.</li>
                    <li>&quot;Project&quot; refers to any consulting engagement arranged between a Business and College Society through the Platform.</li>
                    <li>&quot;Platform Fee&quot; refers to the service charge collected by inHalt for facilitating connections and transactions.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">3. ELIGIBILITY</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    To use the Platform, you must:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                    <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                    <li>Have the legal capacity to enter into binding contracts</li>
                    <li>Represent that all information provided during registration is accurate and complete</li>
                    <li>Not have been previously suspended or banned from the Platform</li>
                    <li>Comply with all applicable laws and regulations in India</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                    For College Societies and Independent Societies: You must be an officially recognised student/non-student organisation with the appropriate authorisation from your educational institution.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    For Businesses: You must be a legitimate business entity or authorised representative thereof.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">4. ACCOUNT REGISTRATION AND RESPONSIBILITIES</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">4.1 Account Creation</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Users must create an account to access Platform services by providing accurate information, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li><strong>For College Societies:</strong> Society name, point of contact name, phone number, establishment date, state, city, domains, services offered, total member count, and college name (if applicable)</li>
                    <li><strong>For Businesses:</strong> Business name, point of contact name, phone number, establishment date, state, city, industry sector, company type, point of contact role, domains, and objectives</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">4.2 Account Security</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities conducted through your account</li>
                    <li>Notifying inHalt immediately of any unauthorised access</li>
                    <li>Ensuring your account information remains current and accurate</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">4.3 Account Verification</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    inHalt reserves the right to verify the authenticity of all user accounts. We may request additional documentation to confirm identity and legitimacy.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">5. PLATFORM SERVICES</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">5.1 Marketplace Functions</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    inHalt provides a platform that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Lists College Societies with their portfolios and capabilities</li>
                    <li>Enables Businesses to search, browse, and express interest in College Societies</li>
                    <li>Facilitates communication between Businesses and College Societies</li>
                    <li>Processes payments securely through the Platform</li>
                    <li>Monitors project progress and completion</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">5.2 Platform Role</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    inHalt acts solely as an intermediary marketplace connecting Businesses and College Societies. We do not:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                    <li>Employ or control College Societies</li>
                    <li>Guarantee the quality, timeliness, or legality of services provided by College Societies</li>
                    <li>Assume responsibility for the actual consulting work performed</li>
                    <li>Act as a party to contracts between Businesses and College Societies</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    The contractual relationship for consulting services exists directly between the Business and the College Society.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">6. PROJECT ENGAGEMENT PROCESS</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">6.1 Eight-Step Process</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    All projects follow this structured workflow:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li><strong>Step 1:</strong> Society Onboarding - College Societies create detailed profiles with portfolios and credentials</li>
                    <li><strong>Step 2:</strong> Society Matchmaking - Businesses browse and express interest in suitable College Societies</li>
                    <li><strong>Step 3:</strong> Notification & Availability - Selected societies receive notifications and confirm availability</li>
                    <li><strong>Step 4:</strong> Initial Evaluation - Parties share details and conduct alignment assessment</li>
                    <li><strong>Step 5:</strong> Advance Payment - Business pays an upfront fee through the Platform (serves as an advance and security deposit)</li>
                    <li><strong>Step 6:</strong> Documentation - Parties execute MOUs, BRDs, and NDAs as required</li>
                    <li><strong>Step 7:</strong> Project Monitoring - Regular reviews are conducted with progress tracking</li>
                    <li><strong>Step 8:</strong> Completion & Final Payment - Upon successful delivery, the remaining payment is processed through inHalt</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">6.2 Direct Contracting</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    While inHalt facilitates connections, Businesses and College Societies must enter into direct contractual agreements (MOUs, BRDs, NDAs) governing their consulting relationship.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">7. PAYMENT TERMS</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">7.1 Platform Fees</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    inHalt charges a service fee for facilitating connections and transactions. The fee structure will be clearly communicated during the engagement process.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">7.2 Payment Processing</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Advance payment is required before project commencement</li>
                    <li>Final payment released upon completion and acceptance of deliverables</li>
                    <li>inHalt may hold payments in escrow until project milestones are met</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">7.3 Refunds and Disputes</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Refund eligibility determined on a case-by-case basis</li>
                    <li>Disputes regarding payments must be submitted through the Platform&apos;s dispute resolution process</li>
                    <li>inHalt reserves the right to withhold payments pending investigation of disputes</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">7.4 Prohibited Transactions</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Users may not circumvent the Platform to avoid fees by conducting transactions outside the Platform after initial connection through inHalt.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">8. USER CONDUCT AND OBLIGATIONS</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">8.1 Acceptable Use</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Users agree to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Provide accurate, complete, and truthful information</li>
                    <li>Use the Platform only for lawful purposes</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Respect the intellectual property rights of others</li>
                    <li>Maintain professional conduct in all interactions</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">8.2 Prohibited Activities</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Users must NOT:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Post false, misleading, or fraudulent information</li>
                    <li>Engage in harassment, discrimination, or abusive behaviour</li>
                    <li>Attempt to circumvent Platform fees or payment systems</li>
                    <li>Use automated systems to access or scrape the Platform</li>
                    <li>Interfere with Platform operations or security</li>
                    <li>Impersonate other users or entities</li>
                    <li>Share account credentials with third parties</li>
                    <li>Engage in any illegal activities</li>
                    <li>Post content that is offensive, defamatory, or violates third-party rights</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">8.3 College Society Specific Obligations</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    College Societies must:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Maintain accurate portfolios and capability descriptions</li>
                    <li>Honour commitments to accepted projects</li>
                    <li>Deliver work within agreed timelines</li>
                    <li>Maintain confidentiality of client information</li>
                    <li>Obtain necessary permissions from educational institutions</li>
                    <li>Ensure team members are adequately qualified</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">8.4 Business Specific Obligations</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Businesses must:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Provide clear project requirements and expectations</li>
                    <li>Make timely payments as agreed</li>
                    <li>Respond promptly to communications</li>
                    <li>Provide necessary resources and information for project completion</li>
                    <li>Respect academic commitments and schedules of College Societies</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">9. INTELLECTUAL PROPERTY RIGHTS</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">9.1 Platform IP</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    All content, features, functionality, trademarks, logos, and design elements of the Platform are owned by inHalt and protected by intellectual property laws. Users may not:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Copy, modify, or distribute Platform materials without permission</li>
                    <li>Use inHalt trademarks or branding without authorisation</li>
                    <li>Reverse engineer or attempt to extract source code</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">9.2 User Content</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    By posting content on the Platform (profiles, portfolios, project descriptions), you grant inHalt a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute such content for Platform operations and marketing purposes.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">9.3 Project Work Product</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Ownership of intellectual property created during consulting projects is governed by direct agreements between Businesses and Societies. inHalt claims no ownership of project deliverables.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">10. CONFIDENTIALITY AND DATA PROTECTION</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">10.1 Confidential Information</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Users may have access to confidential information during Platform use and project engagements. You agree to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Maintain confidentiality of sensitive information</li>
                    <li>Use confidential information only for authorised purposes</li>
                    <li>Implement reasonable security measures to protect data</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">10.2 Privacy Policy</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Use of personal data is governed by our separate Privacy Policy, which is incorporated by reference into these Terms.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">10.3 NDAs</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Parties are encouraged to execute separate Non-Disclosure Agreements for specific projects involving sensitive information.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">11. LIMITATION OF LIABILITY</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">11.1 Disclaimer of Warranties</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-semibold">
                    THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. INHALT DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">11.2 Liability Limitations</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    To the maximum extent permitted by law:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>inHalt is not liable for the quality, accuracy, or legality of services provided by College Societies</li>
                    <li>In case of default on deliverables by the college societies, inHalt will refund 70% of the Advance fee received at the commencement of the project</li>
                    <li>inHalt is not responsible for actions, errors, or omissions of Platform users</li>
                    <li>inHalt is not liable for indirect, incidental, consequential, or punitive damages</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">11.3 Third-Party Content</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    inHalt is not responsible for content posted by users, including portfolios, testimonials, or project descriptions.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">12. INDEMNIFICATION</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    You agree to indemnify, defend, and hold harmless inHalt, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Your violation of these Terms</li>
                    <li>Your use of the Platform</li>
                    <li>Your breach of any law or third-party rights</li>
                    <li>Content you post on the Platform</li>
                    <li>Disputes between you and other users</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">13. DISPUTE RESOLUTION</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">13.1 User-to-User Disputes</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Disputes between Businesses and College Societies regarding project delivery, quality, or payments should first be resolved directly between the parties. If resolution cannot be reached, parties may request inHalt mediation.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">13.2 Platform Dispute Resolution</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    inHalt offers an optional mediation service for user disputes. However, inHalt&apos;s decision in such matters is advisory and non-binding.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">13.3 Disputes with inHalt</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Any disputes with inHalt regarding these Terms or Platform use shall be governed by the laws of India. Parties agree to first attempt resolution through good faith negotiation.[6][2]
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">13.4 Arbitration</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    If negotiation fails, disputes shall be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996, in Kolkata, West Bengal, India. The arbitration shall be conducted in English.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">14. TERMINATION</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">14.1 Termination by User</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    You may terminate your account at any time by contacting inHalt. You remain liable for all obligations incurred before termination.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">14.2 Termination by inHalt</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    inHalt reserves the right to suspend or terminate your account immediately, without notice, if you:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Violate these Terms</li>
                    <li>Engage in fraudulent or illegal activities</li>
                    <li>Pose a security risk to the Platform or other users</li>
                    <li>Fail to make required payments</li>
                    <li>Provide false information</li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">14.3 Effect of Termination</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Upon termination:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Your access to the Platform will cease</li>
                    <li>All outstanding payment obligations remain due</li>
                    <li>Confidentiality obligations survive termination</li>
                    <li>inHalt may retain certain information as required by law</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">15. GOVERNING LAW AND JURISDICTION</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. The courts of Kolkata, West Bengal, India, shall have exclusive jurisdiction over any disputes.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">16. MODIFICATIONS TO TERMS</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    inHalt reserves the right to modify these Terms at any time. We will notify users of material changes via email or Platform notification. Continued use of the Platform after changes constitutes acceptance of the modified Terms.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">17. GENERAL PROVISIONS</h3>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">17.1 Entire Agreement</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    These Terms, together with the Privacy Policy, constitute the entire agreement between you and inHalt regarding Platform use.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">17.2 Severability</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    If any provision of these Terms is found unenforceable, the remaining provisions shall continue in full force and effect.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">17.3 Waiver</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Failure by inHalt to enforce any provision does not constitute a waiver of that provision or any other provision.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">17.4 Assignment</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    You may not assign or transfer these Terms without inHalt&apos;s prior written consent. inHalt may assign these Terms without restriction.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">17.5 Force Majeure</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    inHalt shall not be liable for delays or failures in performance resulting from circumstances beyond its reasonable control.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">17.6 Relationship</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Nothing in these Terms creates a partnership, joint venture, employment, or agency relationship between users and inHalt.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">18. CONTACT INFORMATION</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    For questions, concerns, or notices regarding these Terms, please contact:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-900 dark:text-white font-medium">inHalt</p>
                    <p className="text-gray-700 dark:text-gray-300">Email: supratimdas@inhalt.in</p>
                    <p className="text-gray-700 dark:text-gray-300">Phone: +91 97494 60016</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-outfit">19. ACKNOWLEDGMENT</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                    BY USING THE PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
                  </p>
                </section>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-800 dark:text-blue-300 italic">
                    <strong>Note:</strong> This Terms of Service document should be reviewed by a qualified legal professional familiar with Indian contract law, IT Act 2000, Consumer Protection Act 2019, and relevant regulations before implementation. Consider consulting with legal counsel to ensure compliance with all applicable laws and to tailor provisions to your specific business needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default TermsOfService