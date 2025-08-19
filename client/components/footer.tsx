'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Image
            src="/logo/our-logo.png" 
            alt="Company Logo"
            width={120}
            height={40}
          />
        </div>

        {/* Optional right content (e.g., links, text) */}
        <div className="font-outfit text-sm text-gray-500">
          © 2025 inHalt. All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
