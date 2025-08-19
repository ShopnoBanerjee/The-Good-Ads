"use client";

import Image from "next/image";
import { FC } from "react";

const Intro: FC = () => {
  return (
    <section className="relative w-full py-16 bg-[#a8e0f0]">
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
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a5173] font-outfit drop-shadow-lg">
              Welcome to
              <br />
              The GoodAds
            </h1>
            <p className="text-[#1a5173] text-lg max-w-xl font-semibold mb-12">
              We're building the future of brand collaborations! a vibrant marketplace where college societies meet
              forward-thinking businesses to create innovative, niche-driven content.
            </p>

            <div className="flex items-center space-x-2 mt-8">
              <div className="relative">
                <div className="w-12 h-12 relative -top-4 left-0">
                  <Image
                    src="/illustrations/earth illus.png"
                    alt="Globe icon"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="absolute">
                <p className="text-[#1a5173] text-2xl md:text-3xl font-medium ml-6 font-outfit">
                  For the <span className="text-white font-semibold drop-shadow-md">Creators</span>, By the{" "}
                  <span className="text-white font-semibold drop-shadow-md">Creators</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <Image
                src="/illustrations/intro graphic.png"
                alt="Person pointing at screen with lightbulb"
                width={452}
                height={446}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="pt-8">
          <p className="text-[#1a5173] text-2xl font-bold font-outfit mb-4">Trusted By:</p>
          <div className="bg-[#1A97BA80] p-4 rounded-lg flex flex-wrap justify-between items-center gap-4">
            <Image
              src="/logo/iitk-logo.png"
              alt="IIT KANPUR"
              width={120}
              height={50}
              className="object-contain"
            />
            <Image
              src="/logo/fc-logo.png"
              alt="FAST COMPANY"
              width={120}
              height={50}
              className="object-contain"
            />
            <Image
              src="/logo/mit-logo.png"
              alt="MIT"
              width={80}
              height={50}
              className="object-contain"
            />
            <Image
              src="/logo/forbes-logo.png"
              alt="Forbes"
              width={120}
              height={50}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intro;
