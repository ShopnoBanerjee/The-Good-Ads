"use client";

import Image from "next/image";
import { FC } from "react";

const Intro: FC = () => {
  return (
    <section className="relative w-full py-8 sm:py-12 md:py-16 lg:py-20 bg-[#a8e0f0]">
      {/* Bg at z-0 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/backgrounds/intro-bg.jpg"
          alt="Background"
          fill
          className="object-cover object-[0_10%]"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-[rgba(99,195,221,0.61)]" />
      </div>

      {/* Content At z-10 */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1a5173] font-outfit drop-shadow-lg leading-tight">
              Welcome to
              <br />
              The GoodAds
            </h1>
            <p className="text-[#1a5173] text-base sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 font-semibold">
              We're building the future of brand collaborations! a vibrant marketplace where college societies meet
              forward-thinking businesses to create innovative, niche-driven content.
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
                <p className="text-[#1a5173] text-xl sm:text-2xl md:text-3xl font-medium sm:ml-6 font-outfit text-center lg:text-left">
                  For the <span className="text-white font-semibold drop-shadow-md">Creators</span>, By the{" "}
                  <span className="text-white font-semibold drop-shadow-md">Creators</span>
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
          <p className="text-[#1a5173] text-xl sm:text-2xl font-bold font-outfit mb-3 sm:mb-4 text-center lg:text-left">
            Trusted By:
          </p>
          <div className="bg-[#1A97BA80] p-3 sm:p-4 lg:p-6 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-center justify-items-center">
              <Image
                src="/logo/iitk-logo.png"
                alt="IIT KANPUR"
                width={120}
                height={50}
                className="object-contain w-full max-w-[80px] sm:max-w-[100px] lg:max-w-[120px] h-auto"
              />
              <Image
                src="/logo/fc-logo.png"
                alt="FAST COMPANY"
                width={120}
                height={50}
                className="object-contain w-full max-w-[80px] sm:max-w-[100px] lg:max-w-[120px] h-auto"
              />
              <Image
                src="/logo/mit-logo.png"
                alt="MIT"
                width={80}
                height={50}
                className="object-contain w-full max-w-[60px] sm:max-w-[70px] lg:max-w-[80px] h-auto"
              />
              <Image
                src="/logo/forbes-logo.png"
                alt="Forbes"
                width={120}
                height={50}
                className="object-contain w-full max-w-[80px] sm:max-w-[100px] lg:max-w-[120px] h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intro;
