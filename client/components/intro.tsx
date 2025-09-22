"use client";

import Image from "next/image";
import { FC, useState, useEffect } from "react";
import { useTheme } from "next-themes";

const Intro: FC = () => {
  const { theme } = useTheme();
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
      className="bg-[#a8e0f0] dark:bg-[#15325a] relative w-full py-8 sm:py-12 md:py-16 lg:py-20 transition-colors duration-200 ease-in-out"
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
          className="absolute inset-0 bg-[rgba(99,195,221,0.61)] dark:bg-[rgba(21,50,90,0.8)] transition-colors duration-200 ease-in-out"
          style={{
            transition: 'background-color 0.2s ease-in-out',
          }}
        />
      </div>

      {/* Content At z-10 */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
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
              className="text-[#1a5173] dark:text-gray-200 text-base sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 font-semibold transition-colors duration-200 ease-in-out"
              style={{
              transition: 'color 0.2s ease-in-out',
              }}
            >
              We're building the future of brand collaborations! A marketplace that connects businesses with college societies for contractual projects.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-2 mt-6 sm:mt-8">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 relative sm:-top-4 sm:left-0">
                  <Image
                    src="/illustrations/earth illus.png"
                    alt="Globe icon"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="relative sm:absolute">
                <p 
                  className="text-[#1a5173] dark:text-gray-100 text-xl sm:text-2xl md:text-3xl font-medium sm:ml-6 font-outfit text-center lg:text-left transition-colors duration-200 ease-in-out"
                  style={{
                    transition: 'color 0.2s ease-in-out',
                  }}
                >
                  <span className="text-white font-semibold drop-shadow-md">Teams.</span>
                  <span className="text-white font-semibold drop-shadow-md">Tailor-made.</span>{" "}
                  <span className="text-white font-semibold drop-shadow-md">To you.</span>
                </p>
              </div>
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

        <div className="pt-6 sm:pt-8 lg:pt-12">
          {/* Trusted By section removed as requested */}
        </div>
      </div>
    </section>
  );
};

export default Intro;
