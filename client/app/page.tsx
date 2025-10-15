"use client";

import Header from '@/components/header';
import Footer from '@/components/footer';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Users, Target, TrendingUp, Award, Building2, CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type Lenis from 'lenis';
import { useTheme } from 'next-themes';

const Home: React.FC = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisReady, setLenisReady] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const overlayBackground = resolvedTheme === 'dark' ? 'rgba(21, 50, 90, 0.85)' : 'rgba(22, 121, 168, 0.8)';
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const wwdSectionRef = useRef<HTMLElement | null>(null);
  const servicesSectionRef = useRef<HTMLElement | null>(null);
  const ctaSectionRef = useRef<HTMLElement | null>(null);

  const scrollY = useMotionValue(0);

  // Convert the global scroll position into a clamped 0-1 progress for a section.
  const createSectionProgress = (value: number, element: HTMLElement | null, padding = 0) => {
    if (!element) {
      return 0;
    }
    const start = element.offsetTop - padding;
    const end = start + element.offsetHeight + padding * 2;
    if (end === start) {
      return 0;
    }
    const progress = (value - start) / (end - start);
    return Math.min(Math.max(progress, 0), 1);
  };

  // Translate section progress into concrete transform values for parallax motion.
  const useCreateParallax = (ref: React.RefObject<HTMLElement | null>, range: [number, number], padding = 0) =>
    useTransform(scrollY, (value) => {
      const progress = createSectionProgress(value, ref.current, padding);
      return range[0] + (range[1] - range[0]) * progress;
    });

  const heroBgY = useCreateParallax(heroSectionRef, [0, 140], 100);
  const heroOverlayY = useCreateParallax(heroSectionRef, [0, 80], 100);
  const heroForegroundY = useCreateParallax(heroSectionRef, [0, -60], 100);

  const wwdBgY = useCreateParallax(wwdSectionRef, [-60, 160], 120);
  const wwdOverlayY = useCreateParallax(wwdSectionRef, [-40, 120], 120);
  const wwdDecorY = useCreateParallax(wwdSectionRef, [0, 200], 120);
  const wwdContentY = useCreateParallax(wwdSectionRef, [0, -50], 120);
  const wwdIllustrationY = useCreateParallax(wwdSectionRef, [0, 90], 120);

  const servicesOverlayY = useCreateParallax(servicesSectionRef, [-80, 80], 150);
  const ctaOverlayY = useCreateParallax(ctaSectionRef, [-120, 90], 150);

  useEffect(() => {
    let isMounted = true;
    let lenisInstance: Lenis | null = null;

    const initLenis = async () => {
      try {
        const { default: Lenis } = await import('lenis');
        if (!isMounted) {
          return;
        }

        lenisInstance = new Lenis({
          lerp: 0.1,
          smoothWheel: true,
          autoResize: true,
          autoRaf: true,
        });

        lenisRef.current = lenisInstance;
        setLenisReady(true);
      } catch (error) {
        console.error('Lenis init error:', error);
      }
    };

    initLenis();

    return () => {
      isMounted = false;
      if (lenisInstance) {
        lenisInstance.destroy();
      }
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!lenisReady || !contentRef.current || !lenisRef.current) {
      return;
    }

    const lenis = lenisRef.current;
    const container = contentRef.current;

    const resizeLenis = () => {
      lenis.resize();
    };

    const resizeObserver = new ResizeObserver(resizeLenis);
    resizeObserver.observe(container);

    const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
    images.forEach((img) => {
      if (img.complete) {
        return;
      }
      img.addEventListener('load', resizeLenis, { once: true });
    });

    resizeLenis();

    return () => {
      resizeObserver.disconnect();
      images.forEach((img) => img.removeEventListener('load', resizeLenis));
    };
  }, [lenisReady]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateFromWindow = () => {
      scrollY.set(window.scrollY);
    };

    if (!lenisRef.current) {
      updateFromWindow();
      window.addEventListener('scroll', updateFromWindow, { passive: true });

      return () => {
        window.removeEventListener('scroll', updateFromWindow);
      };
    }

    const lenis = lenisRef.current;

    const handleLenisScroll = ({ scroll }: { scroll: number }) => {
      scrollY.set(scroll);
    };

    updateFromWindow();
    lenis.on('scroll', handleLenisScroll);

    return () => {
      lenis.off('scroll', handleLenisScroll);
    };
  }, [scrollY, lenisReady]);

  return (
    <div ref={contentRef}>
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      <div className="w-full bg-[#f8fafc] dark:bg-[#15325a] text-[#193747] dark:text-white transition-colors duration-200 ease-in-out">
        {/* INTRO SECTION - Inspired by intro.tsx */}
        <section
          ref={heroSectionRef}
          className="relative w-full overflow-hidden py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-[#f8fafc] to-[#f0f5fa] dark:from-[#15325a] dark:to-[#0f1f3a] transition-colors duration-200 ease-in-out"
        >
          {/* Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div className="absolute inset-0" style={{ y: heroBgY }}>
              <div className="relative h-full w-full">
                <Image
                  src="/backgrounds/intro-bg.jpg"
                  alt="Background"
                  fill
                  className="object-cover object-[0_10%]"
                  priority
                />
              </div>
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-[rgba(52,145,171,0.76)] dark:bg-[rgba(21,50,90,0.8)] transition-colors duration-200 ease-in-out"
              style={{ y: heroOverlayY }}
            />
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              <motion.div
                style={{ y: heroForegroundY }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="space-y-6 text-center lg:text-left"
              >

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white dark:text-white font-outfit drop-shadow-lg leading-tight transition-colors duration-200 ease-in-out">
                  Welcome to
                  <br />
                  inHalt
                </h1>

                <p className="text-white dark:text-gray-200 text-base sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 font-semibold leading-relaxed transition-colors duration-200 ease-in-out">
                  A marketplace that connects businesses with college societies for contractual projects.
                </p>

                <div className="flex items-center justify-center lg:justify-start gap-4 mt-8 sm:mt-10 lg:mt-12">
                  <div className="flex-shrink-0">
                    <Image
                      src="/illustrations/earth illus.png"
                      alt="Globe icon"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-white text-xl sm:text-2xl md:text-3xl font-medium font-outfit transition-colors duration-200 ease-in-out">
                    <span className="text-white font-semibold drop-shadow-md">Teams.</span>{" "}
                    <span className="text-white font-semibold drop-shadow-md">Tailor-made.</span>{" "}
                    <span className="text-white font-semibold drop-shadow-md">To you.</span>
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  className="pt-8"
                >
                  <Link
                    href="/auth"
                    className="relative bg-[#A3DAEF] hover:bg-[#92d4e6] text-[#1a5173] px-10 py-4 rounded-2xl font-outfit font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl text-center transform hover:scale-105 active:scale-95 dark:bg-[#92d4e6] dark:hover:bg-[#7dc4d9] dark:text-[#1a5173] inline-block group"
                  >
                    <span className="relative z-10 flex items-center gap-2 justify-center">
                      Join inHalt
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="flex justify-center lg:justify-end mt-8 lg:mt-0"
              >
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <Image
                    src="/illustrations/intro graphic.png"
                    alt="Person pointing at screen with lightbulb"
                    width={452}
                    height={446}
                    className="object-contain w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* WHAT WE DO SECTION - Inspired by wwd.tsx */}
        <section ref={wwdSectionRef} className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
          {/* Background */}
          <motion.div
            className="absolute inset-0 bg-[url('/backgrounds/wwd-bg.jpg')] bg-cover bg-center opacity-90 pointer-events-none"
            aria-hidden="true"
            style={{ y: wwdBgY }}
          />

          <motion.div
            className="absolute inset-0 pointer-events-none transition-colors duration-200 ease-in-out"
            aria-hidden="true"
            style={{
              backgroundColor: overlayBackground,
              y: wwdOverlayY,
            }}
          />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-outfit drop-shadow-2xl leading-tight mb-6">
                What We Do?
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed max-w-4xl mx-auto">
                inHalt connects businesses with college societies and student-run organizations for innovative consulting and project needs, showcasing each society&rsquo;s portfolio and achievements for transparent, informed partnerships
              </p>
            </motion.div>

            {/* We Connect Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 lg:gap-12 mb-16"
            >
              <motion.div
                className="relative z-0 order-2 lg:order-1"
                style={{ y: wwdContentY }}
              >
                <div className="absolute inset-0 opacity-30 blur-2xl rounded-full bg-[#1986A4] dark:bg-[#1f5f7a]" />
                <div className="p-4 sm:p-6 relative z-10">
                  <p className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-medium ml-2 sm:ml-4 lg:ml-6 font-outfit leading-tight">
                    We<span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-semibold drop-shadow-md"> Connect </span>businesses<br />with students
                  </p>
                  <p className="pt-4 sm:pt-6 lg:pt-8 pl-2 sm:pl-4 lg:pl-6 font-normal text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl leading-relaxed">
                    We bridge the gap between innovative companies and the brightest college talent. Students gain real-world experience and sustainable revenue.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex justify-center overflow-hidden order-1 lg:order-2 relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl h-64 sm:h-80 md:h-96 lg:h-[400px] xl:h-[500px]"
                style={{ y: wwdIllustrationY }}
              >
                <Image
                  fill
                  src="/illustrations/illus2whatwedo.png"
                  alt="Illustration 1"
                  className="object-contain rounded-lg"
                />
              </motion.div>
            </motion.div>

            {/* We Support Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 lg:gap-12 mb-20"
            >
              <motion.div
                className="flex justify-center overflow-hidden relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-64 sm:h-80 md:h-96 lg:h-[400px] xl:h-[450px]"
                style={{ y: wwdIllustrationY }}
              >
                <Image
                  fill
                  src="/illustrations/illus whatwedo.png"
                  alt="Illustration 2"
                  className="object-contain rounded-lg"
                />
              </motion.div>

              <motion.div className="relative z-0" style={{ y: wwdContentY }}>
                <div className="absolute inset-0 opacity-30 blur-2xl rounded-full bg-[#1986A4] dark:bg-[#1f5f7a]" />
                <div className="p-4 sm:p-6 relative z-10">
                  <p className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-medium ml-2 sm:ml-4 lg:ml-6 font-outfit leading-tight">
                    We<span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-semibold drop-shadow-md"> Support </span>businesses<br />across industries
                  </p>
                  <p className="pt-4 sm:pt-6 lg:pt-8 pl-2 sm:pl-4 lg:pl-6 font-normal text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl leading-relaxed">
                    From finance and consulting to marketing, tech, and multimedia production, companies can efficiently outsource to credible, niche-focused teams by reviewing past projects and testimonials.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Services Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 lg:mb-12 font-outfit text-white drop-shadow-2xl leading-tight">
                Our Services To
              </h2>

              <div className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                <div className="flex flex-col sm:flex-row w-full rounded-t-3xl sm:rounded-tl-3xl sm:rounded-tr-3xl rounded-br-3xl sm:rounded-br-[120px] md:rounded-br-[180px] lg:rounded-br-[233px] rounded-bl-3xl sm:rounded-bl-[120px] md:rounded-bl-[180px] lg:rounded-bl-[233px] shadow-[0px_4px_4px_5px_rgba(0,0,0,0.25)] overflow-hidden">

                  <Link
                    href=""
                    className="w-full sm:w-1/2 bg-[#92d4e6] dark:bg-[#2b4c66] text-[#1a5173] dark:text-white flex items-center justify-center hover:bg-[#7dc4d9] dark:hover:bg-[#1e3c52] hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-t-3xl sm:rounded-tl-3xl sm:rounded-tr-none rounded-bl-none sm:rounded-bl-[120px] md:rounded-bl-[180px] lg:rounded-bl-[233px] shadow-none sm:shadow-[10px_0px_5px_rgba(0,0,0,0.25)] z-10 min-h-[120px] sm:min-h-[200px] md:min-h-[300px] lg:min-h-[400px]"
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold font-outfit drop-shadow-2xl text-center leading-tight">
                      College<br />Societies
                    </div>
                  </Link>

                  <Link
                    href=""
                    className="w-full sm:w-1/2 bg-[#A3DAEF] dark:bg-[#34546b] text-[#1a5173] dark:text-white flex items-center justify-center hover:bg-[#8ed1eb] dark:hover:bg-[#274157] hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-b-3xl sm:rounded-tr-3xl sm:rounded-bl-none rounded-br-3xl sm:rounded-br-[120px] md:rounded-br-[180px] lg:rounded-br-[233px] min-h-[120px] sm:min-h-[200px] md:min-h-[300px] lg:min-h-[400px]"
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold font-outfit drop-shadow-2xl text-center leading-tight">
                      Companies/<br />Startups
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Decorative overlay */}
          <motion.div
            className="absolute left-0 mb-40 right-0 mx-auto z-40 w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl h-64 sm:h-80 md:h-96 lg:h-[400px] xl:h-[500px] pointer-events-none -bottom-12 sm:-bottom-16 md:-bottom-20 lg:-bottom-24"
            style={{ y: wwdDecorY }}
          >
            <div className="relative w-full h-full">
              <Image
                fill
                src="/illustrations/comb standing.png"
                alt="Decorative Overlay"
                className="object-contain"
              />
            </div>
          </motion.div>
        </section>

        {/* OUR SERVICES SECTION - Inspired by our-services page */}
        <section
          ref={servicesSectionRef}
          className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-32 bg-[#f0f9ff] dark:bg-[#15325a] transition-colors duration-200 ease-in-out"
        >
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#cfe9f5]/60 via-transparent to-[#11aad4]/20 dark:from-[#0f1f3a]/70 dark:via-transparent dark:to-[#0b6a8d]/30"
            style={{ y: servicesOverlayY }}
          />
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
        </section>

        {/* CTA SECTION - Inspired by intro.tsx */}
        <section
          ref={ctaSectionRef}
          className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-[#A3DAEF] via-[#92d4e6] to-[#7dc4d9] dark:from-[#2b4c66] dark:via-[#34546b] dark:to-[#1e3c52] relative overflow-hidden transition-colors duration-200"
        >
          <motion.div
            className="absolute inset-0 bg-white/10 dark:bg-black/10"
            style={{ y: ctaOverlayY }}
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a5173] dark:text-white font-outfit mb-6 leading-tight drop-shadow-md">
                Ready to Get Started?
              </h2>
              <p className="text-lg sm:text-xl text-[#1a5173]/80 dark:text-white/90 font-outfit mb-10 max-w-2xl mx-auto leading-relaxed">
                Join inHalt today and connect with talented college societies or find the perfect business partner for your projects.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <Link
                  href="/auth"
                  className="relative bg-white hover:bg-[#f8fafc] text-[#1a5173] px-10 py-4 rounded-2xl font-outfit font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl text-center transform hover:scale-105 active:scale-95 dark:bg-white dark:hover:bg-gray-100 dark:text-[#1a5173] inline-block group"
                >
                  <span className="relative z-10 flex items-center gap-2 justify-center">
                    Join inHalt
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer/>
    </div>
  );
};

export default Home;