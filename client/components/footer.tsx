'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MdEmail, MdPhone } from 'react-icons/md';

export default function Footer() {
  return (
    <footer className="bg-[#0B2545] text-white">
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
            <p className="font-outfit text-xs sm:text-sm text-gray-400 text-center lg:text-left border-t lg:border-none border-gray-700 pt-4 lg:pt-0 w-full">
              © 2025 inHalt. All Rights Reserved.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4 text-center w-full lg:w-auto">
            <Link 
              href="/" 
              className="font-outfit text-base text-gray-200 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="font-outfit text-base text-gray-200 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link 
              href="/privacy-policy" 
              className="font-outfit text-base text-gray-200 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms-of-service" 
              className="font-outfit text-base text-gray-200 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-3 items-center lg:items-end pt-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-200">
              <MdEmail className="text-blue-400 text-lg" />
              <a 
                href="mailto:support@thegoodads.com" 
                className="font-outfit text-blue-400 hover:text-blue-300 transition-colors break-all"
              >
                support@inHalt.in
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-200">
              <MdPhone className="text-blue-400 text-lg" />
              <a 
                href="tel:+1234567890" 
                className="font-outfit text-blue-400 hover:text-blue-300 transition-colors"
              >
                +91 12345 67890
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
