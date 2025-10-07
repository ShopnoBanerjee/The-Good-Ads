"use client";

import Header from '@/components/header';
import Intro from '@/components/intro';
import Wwd from '@/components/wwd';
import Footer from '@/components/footer';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <Intro />
      <section className="py-10 sm:py-14 md:py-16 lg:py-24 bg-gradient-to-r from-[#11aad4] to-blue-600 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-outfit mb-4 leading-tight">
                Ready to Get Started?
              </h2>
              <p className="text-lg sm:text-xl text-white/90 font-outfit mb-6 max-w-2xl mx-auto lg:mx-0">
                Join inHalt today and connect with talented college societies or find the perfect business partner for your projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth" className="bg-white text-[#11aad4] px-6 py-3 rounded-xl font-outfit font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl text-center">
                  Join as a Business
                </Link>
                <Link href="/auth" className="bg-white text-[#11aad4] px-6 py-3 rounded-xl font-outfit font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl text-center">
                  Join as a Society
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                <Image
                  src="/illustrations/cta-image.png"
                  alt="CTA Illustration"
                  width={400}
                  height={400}
                  className="object-contain w-full h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements for style */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12"></div>
      </section>
      <Wwd />
      <Footer />
    </>
  );
};

export default Home;
