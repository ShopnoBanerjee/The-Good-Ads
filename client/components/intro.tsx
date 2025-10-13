"use client";

import Image from "next/image";
import Link from "next/link";
import { FC, useState, useEffect } from "react";

const Intro: FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <section className="relative w-full py-8 sm:py-12 md:py-16 lg:py-20 bg-[#a8e0f0]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/backgrounds/intro-bg.jpg"
            alt="Background"
            fill
            className="object-cover object-[0_10%]"
          />
          <div className="absolute inset-0 bg-[rgba(99,195,221,0.61)]" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="w-80 h-20 bg-gray-300 animate-pulse rounded"></div>
              <div className="w-full h-32 bg-gray-300 animate-pulse rounded"></div>
              <div className="w-96 h-12 bg-gray-300 animate-pulse rounded"></div>
            </div>
            <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="w-96 h-96 bg-gray-300 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="bg-[rgba(0,200,255,0.76)] dark:bg-[#15325a] relative w-full py-8 sm:py-12 md:py-16 lg:py-20 transition-colors duration-200 ease-in-out"
      style={{
        transition: 'background-color 0.2s ease-in-out',
      }}
    >
      {/* Bg at z-0 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/backgrounds/intro-bg.jpg"
          alt="Background"
          fill
          className="object-cover object-[0_10%]"
        />
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-[rgba(0,200,255,0.76)] dark:bg-[rgba(21,50,90,0.8)] transition-colors duration-200 ease-in-out"
          style={{
            transition: 'background-color 0.2s ease-in-out',
          }}
        />
      </div>

      {/* Content At z-10 */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 lg:space-y-10 text-center lg:text-left">
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1a5173] dark:text-white font-outfit drop-shadow-lg leading-tight transition-colors duration-200 ease-in-out"
              style={{
                transition: 'color 0.2s ease-in-out',
              }}
            >
              Welcome to
              <br />
              inHalt
            </h1>
            <p 
              className="text-[#1a5173] dark:text-gray-200 text-base sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 font-semibold leading-relaxed transition-colors duration-200 ease-in-out"
              style={{
              transition: 'color 0.2s ease-in-out',
              }}
            >
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
              <p 
                className="text-[#1a5173] dark:text-gray-100 text-xl sm:text-2xl md:text-3xl font-medium font-outfit transition-colors duration-200 ease-in-out"
                style={{
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                <span className="text-white font-semibold drop-shadow-md">Teams.</span>{" "}
                <span className="text-white font-semibold drop-shadow-md">Tailor-made.</span>{" "}
                <span className="text-white font-semibold drop-shadow-md">To you.</span>
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              <Image
                src="/illustrations/intro graphic.png"
                alt="Person pointing at screen with lightbulb"
                width={452}
                height={446}
                className="object-contain w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12 pt-8 sm:pt-10 lg:pt-12 border-t border-white/20">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a5173] dark:text-white font-outfit mb-4 leading-tight transition-colors duration-200 ease-in-out">
              Ready to Get Started?
            </h2>
            <p className="text-[#1a5173] dark:text-gray-200 text-base sm:text-lg max-w-2xl mx-auto mb-6 font-medium leading-relaxed transition-colors duration-200 ease-in-out">
              Join inHalt today and connect with talented college societies or find the perfect business partner for your projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth" className="bg-[#11aad4] hover:bg-[#0d8bb8] text-white px-6 py-3 rounded-xl font-outfit font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-center transform hover:scale-105">
                Join as a Business
              </Link>
              <Link href="/auth" className="bg-white hover:bg-gray-50 text-[#11aad4] border-2 border-[#11aad4] hover:border-[#0d8bb8] px-6 py-3 rounded-xl font-outfit font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-center transform hover:scale-105">
                Join as a Society
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intro;
