'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MdEmail, MdPhone } from 'react-icons/md';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <footer className="bg-[#0B2545] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 lg:gap-20">
            <div className="flex flex-col items-center lg:items-start gap-4 flex-shrink-0 w-full lg:w-auto">
              <div className="flex items-center overflow-hidden h-20 pt-2">
                <Image
                  src="/logo/our-logo.png"
                  alt="Company Logo"
                  width={240}
                  height={80}
                  className="w-auto h-28 object-contain"
                />
              </div>
              <p className="font-outfit text-xs sm:text-sm text-gray-400 text-center lg:text-left border-t lg:border-none border-gray-700 pt-4 lg:pt-0 w-full">
                © 2025 inHalt. All Rights Reserved.
              </p>
            </div>
            <div className="w-32 h-40 bg-gray-700 animate-pulse rounded"></div>
            <div className="w-48 h-20 bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer 
      className="bg-white dark:bg-[#15325a] text-[#0B2545] dark:text-white transition-colors duration-200 ease-in-out"
      style={{
        transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 lg:gap-20">
          
          {/* Left section: Logo + Copyright */}
          <div className="flex flex-col items-center lg:items-start gap-4 flex-shrink-0 w-full lg:w-auto">
            <div className="flex items-center overflow-hidden h-20 pt-2">
              <Image
                src="/logo/our-logo.png"
                alt="Company Logo"
                width={240}
                height={80}
                className="w-auto h-28 object-contain"
              />
            </div>
            <p 
              className="font-outfit text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center lg:text-left border-t lg:border-none border-gray-300 dark:border-gray-700 pt-4 lg:pt-0 w-full transition-colors duration-200 ease-in-out"
              style={{
                transition: 'color 0.2s ease-in-out, border-color 0.2s ease-in-out',
              }}
            >
              © 2025 inHalt. All Rights Reserved.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4 text-center lg:text-left w-full lg:w-auto">
            <Link 
              href="/" 
              className="font-outfit text-base text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-primary transition-colors duration-200 ease-in-out"
              style={{
                transition: 'color 0.2s ease-in-out',
              }}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="font-outfit text-base text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-primary transition-colors duration-200 ease-in-out"
              style={{
                transition: 'color 0.2s ease-in-out',
              }}
            >
              About
            </Link>
            <Link 
              href="/privacy-policy" 
              className="font-outfit text-base text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-primary transition-colors duration-200 ease-in-out"
              style={{
                transition: 'color 0.2s ease-in-out',
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms-of-service" 
              className="font-outfit text-base text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-primary transition-colors duration-200 ease-in-out"
              style={{
                transition: 'color 0.2s ease-in-out',
              }}
            >
              Terms of Service
            </Link>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-3 items-center lg:items-end pt-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MdEmail className="text-blue-500 dark:text-blue-400 text-lg transition-colors duration-200 ease-in-out" />
              <a 
                href="mailto:supratimdas@inhalt.in" 
                className="font-outfit text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 ease-in-out break-all"
                style={{
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                supratimdas@inhalt.in
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MdPhone className="text-blue-500 dark:text-blue-400 text-lg transition-colors duration-200 ease-in-out" />
              <a 
                href="tel:+91 9749460016" 
                className="font-outfit text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 ease-in-out"
                style={{
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                +91 97494 60016
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
