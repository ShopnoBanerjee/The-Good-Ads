"use client";

import Header from '@/components/header';
import Footer from '@/components/footer';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle, Users, Building2, TrendingUp, Target, Award, XCircle } from 'lucide-react';

const OurServices: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
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
    );
  }

  return (
    <>
      <Header />
      <main className="bg-[#f0f9ff] dark:bg-[#15325a] transition-colors duration-200 ease-in-out">
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20">
          <div
            className="absolute inset-0 bg-[url('/backgrounds/wwd-bg.jpg')] bg-cover bg-center opacity-30 dark:opacity-15 pointer-events-none"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#11aad4]/10 to-blue-600/5 dark:from-[#11aad4]/5 dark:to-blue-600/5"></div>
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#15325a] dark:text-white font-outfit mb-4 leading-tight">
            Our Services
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-outfit max-w-3xl mx-auto leading-relaxed">
            Bridging the gap between innovative businesses and talented college societies for mutually beneficial partnerships
              </p>
            </div>
          </div>
        </section>

        {/* Service to Society Section */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-50 dark:bg-[#0f1f3a]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 px-4 py-2 rounded-full">
                    <Users className="w-5 h-5 text-[#11aad4]" />
                    <span className="text-[#11aad4] font-outfit font-medium">For College Societies</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#15325a] dark:text-white font-outfit leading-tight">
                    Where students seek support
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-[#15325a] dark:text-white font-outfit mb-2">
                          Inconsistent Access to Real-World Projects
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 font-outfit">
                          College societies often face inconsistent access to real-world projects, which limits their exposure, learning, and professional development.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-[#15325a] dark:text-white font-outfit mb-2">
                          Limited Professional Development Opportunities
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 font-outfit">
                          There is a need for students to gain invaluable hands-on experience to enhance their professional development.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-[#15325a] dark:text-white font-outfit mb-2">
                          Funding and Self-Sufficiency Challenges
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 font-outfit">
                          Societies need sustainable revenue streams to fund their operations and become more self-sufficient throughout the year.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#11aad4]/20 dark:bg-[#11aad4]/10 rounded-2xl blur-3xl"></div>
                  <div className="relative bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-xl">
                    <Image
                      src="/illustrations/student_collaboration.png"
                      alt="Student collaboration illustration - showing diverse group of students working together on projects"
                      width={400}
                      height={300}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How inHalt Helps Society Section */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 relative">
          <div
            className="absolute inset-0 bg-[url('/backgrounds/wwd-bg.jpg')] bg-cover bg-center opacity-20 dark:opacity-10 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#15325a] dark:text-white font-outfit mb-6">
                How inHalt Addresses These Challenges
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-outfit">
                Our platform empowers student talent by creating meaningful connections
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-[#11aad4]" />
                </div>
                <h3 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit mb-4">
                  Supply & Demand Connection
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-outfit">
                  Directly links businesses with college societies for their contractual project needs, leveraging the growing popularity and professionalism of college societies.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-[#11aad4]" />
                </div>
                <h3 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit mb-4">
                  Cost-Effective Solutions
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-outfit">
                  Businesses can tap into the fresh perspectives and digital fluency of India&apos;s youth at a fraction of traditional consultant costs.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-[#11aad4]" />
                </div>
                <h3 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit mb-4">
                  Real-World Experience & Revenue
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-outfit">
                  Empowers college societies to leverage their talent for real-world projects, providing hands-on experience and sustainable revenue streams.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service to Business Section */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-50 dark:bg-[#0f1f3a]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-600/10 rounded-2xl blur-3xl"></div>
                  <div className="relative bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-xl">
                    <Image
                      src="/illustrations/business-growth.png"
                      alt="Business growth illustration - showing company growth chart and professional collaboration"
                      width={400}
                      height={300}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-blue-600/10 dark:bg-blue-600/20 px-4 py-2 rounded-full">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-600 font-outfit font-medium">For Businesses</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#15325a] dark:text-white font-outfit leading-tight">
                    Innovative Business Solutions
                  </h2>

                  <p className="text-lg text-gray-600 dark:text-gray-300 font-outfit leading-relaxed">
                    inHalt offers distinct and valuable benefits to both businesses and college societies by creating a streamlined marketplace for project collaboration.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-[#15325a] dark:text-white font-outfit mb-2">
                          Cost-Effective Consulting
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 font-outfit">
                          Access innovative, market-relevant strategies at a fraction of traditional consulting costs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-[#15325a] dark:text-white font-outfit mb-2">
                          Fresh Perspectives & Digital Fluency
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 font-outfit">
                          Tap into India&apos;s youth, particularly Millennials and Gen-Z, for contemporary insights and agile solutions.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-[#15325a] dark:text-white font-outfit mb-2">
                          Streamlined Outsourcing Process
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 font-outfit">
                          Easily browse through college societies, review portfolios, past projects, client testimonials, and team qualifications.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits for Businesses */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 relative">
          <div
            className="absolute inset-0 bg-[url('/backgrounds/wwd-bg.jpg')] bg-cover bg-center opacity-15 dark:opacity-5 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#15325a] dark:text-white font-outfit mb-6">
                Key Benefits for Businesses
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-outfit">
                Why choose inHalt for your project needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/10 dark:bg-green-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit">
                      Practical Cost Solutions
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-outfit">
                    Makes it practical for companies of any size to address smaller-scale project needs without incurring hefty fees for extensive research and manpower.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit">
                      Contemporary Insights
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-outfit">
                    Allows businesses to tap into fresh perspectives, digital fluency, contemporary insights, and agile solutions that align with rapidly evolving marketplaces.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit">
                      Transparent Credibility
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-outfit">
                    Comprehensive listings with portfolios, executive summaries, and key achievements foster credibility and trust for informed business decisions.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-500/10 dark:bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit">
                      Project-Specific Solutions
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-outfit">
                    Helps businesses fulfill operational needs and specific project requirements by connecting them with specialized, niche-focused college society teams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-r from-[#11aad4] to-blue-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-outfit mb-6 leading-tight">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 font-outfit mb-8 max-w-2xl mx-auto">
              Join inHalt today and connect with talented college societies or find the perfect business partner for your projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth" className="bg-white text-[#11aad4] px-8 py-4 rounded-xl font-outfit font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl text-center">
                Join as a Business
              </Link>
              <Link href="/auth" className="bg-white text-[#11aad4] px-8 py-4 rounded-xl font-outfit font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl text-center">
                Join as a Society
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default OurServices;