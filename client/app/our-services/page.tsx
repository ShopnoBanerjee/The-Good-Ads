"use client";

import Header from '@/components/header';
import Footer from '@/components/footer';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CheckCircle, Users, Building2, TrendingUp, Target, Award, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

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
      <main className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-32 bg-[#f0f9ff] dark:bg-[#15325a] transition-colors duration-200 ease-in-out">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#cfe9f5]/60 via-transparent to-[#11aad4]/20 dark:from-[#0f1f3a]/70 dark:via-transparent dark:to-[#0b6a8d]/30" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#15325a] dark:text-white font-outfit mb-4 leading-tight">
              Our Services
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-outfit max-w-3xl mx-auto leading-relaxed">
              Bridging the gap between innovative businesses and talented college societies for mutually beneficial partnerships
            </p>
          </motion.div>

          {/* For College Societies */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20"
          >
            <div className="order-2 lg:order-1">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 px-4 py-2 rounded-full">
                  <Users className="w-5 h-5 text-[#11aad4]" />
                  <span className="text-sm font-semibold text-[#11aad4]">College Societies</span>
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#15325a] dark:text-white font-outfit leading-tight">
                  Where students seek support
                </h3>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <ArrowRight className="w-5 h-5 text-[#11aad4] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-[#15325a] dark:text-white">Project Opportunities</h4>
                      <p className="text-gray-600 dark:text-gray-300">Access to real-world projects that build portfolios and experience.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <ArrowRight className="w-5 h-5 text-[#11aad4] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-[#15325a] dark:text-white">Revenue Generation</h4>
                      <p className="text-gray-600 dark:text-gray-300">Monetize skills and fund society activities through paid projects.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <ArrowRight className="w-5 h-5 text-[#11aad4] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-[#15325a] dark:text-white">Professional Network</h4>
                      <p className="text-gray-600 dark:text-gray-300">Build connections with industry professionals and businesses.</p>
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
                    alt="Student collaboration illustration"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* How inHalt Helps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#15325a] dark:text-white font-outfit mb-6">
              How inHalt Addresses These Challenges
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-outfit">
              Our platform empowers student talent by creating meaningful connections
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-[#11aad4]" />
              </div>
              <h4 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit mb-4">
                Supply & Demand Connection
              </h4>
              <p className="text-gray-600 dark:text-gray-300 font-outfit">
                Directly links businesses with college societies for their contractual project needs, leveraging the growing popularity and professionalism of college societies.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-[#11aad4]" />
              </div>
              <h4 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit mb-4">
                Cost-Effective Solutions
              </h4>
              <p className="text-gray-600 dark:text-gray-300 font-outfit">
                Businesses can tap into the fresh perspectives and digital fluency of India&rsquo;s youth at a fraction of traditional consultant costs.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-[#11aad4]" />
              </div>
              <h4 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit mb-4">
                Real-World Experience & Revenue
              </h4>
              <p className="text-gray-600 dark:text-gray-300 font-outfit">
                Empowers college societies to leverage their talent for real-world projects, providing hands-on experience and sustainable revenue streams.
              </p>
            </div>
          </motion.div>

          {/* For Businesses */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20"
          >
            <div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-600/10 rounded-2xl blur-3xl"></div>
                <div className="relative bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-xl">
                  <Image
                    src="/illustrations/business-growth.png"
                    alt="Business growth illustration"
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
                  <span className="text-sm font-semibold text-blue-600">Business Solutions</span>
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#15325a] dark:text-white font-outfit leading-tight">
                  Innovative Business Solutions
                </h3>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-600 dark:text-gray-300">Access to specialized, cost-effective talent pools</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-600 dark:text-gray-300">Fresh perspectives and contemporary digital solutions</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-600 dark:text-gray-300">Transparent evaluation through portfolios and testimonials</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#15325a] dark:text-white font-outfit mb-6">
              Key Benefits for Businesses
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-outfit">
              Why choose inHalt for your project needs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#11aad4]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit">
                    Practical Cost Solutions
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-outfit">
                  Address smaller-scale project needs without hefty fees associated with large consulting firms.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#11aad4]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit">
                    Contemporary Insights
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-outfit">
                  Tap into fresh perspectives and agile solutions from the new generation of digital natives.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#11aad4]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit">
                    Credibility & Trust
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-outfit">
                  Make informed decisions through comprehensive portfolios and verified testimonials.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1a2f4a] rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#11aad4]/10 dark:bg-[#11aad4]/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#11aad4]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#15325a] dark:text-white font-outfit">
                    Specialized Teams
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-outfit">
                  Connect with niche-focused college society teams that excel in specific domains.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OurServices;