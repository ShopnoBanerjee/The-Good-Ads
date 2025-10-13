"use client";

// import Header from '@/components/header';
// import Intro from '@/components/intro';
// import Wwd from '@/components/wwd';
// import Footer from '@/components/footer';
import React from 'react';

const Home: React.FC = () => {
  return (
    <>
      {/* <Header />
      <Intro />
      <Wwd />
      <Footer /> */}
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-xl text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-white/60 dark:bg-gray-800/60 shadow">
          {/* simple spinner */}
          <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">We&apos;ll be back soon</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          The site is currently under maintenance. All services, including registration, are temporarily offline.
          We&apos;re working to bring everything back as quickly as possible.
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400">Please check back in a little while. Thank you for your patience.</p>
      </div>
    </main>
    </>
  );
};

export default Home;
